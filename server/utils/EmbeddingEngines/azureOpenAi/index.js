const { toChunks } = require("../../helpers");

class AzureOpenAiEmbedder {
  constructor() {
    const { AzureOpenAI } = require("openai");
    if (!process.env.AZURE_OPENAI_ENDPOINT)
      throw new Error("No Azure API endpoint was set.");

    // Check if Azure AD authentication is configured
    const hasAzureAD = !!(
      process.env.AZURE_TENANT_ID &&
      process.env.AZURE_CLIENT_ID &&
      process.env.AZURE_CLIENT_SECRET &&
      process.env.AZURE_ACCESS_SCOPE
    );

    // Check if API key authentication is configured
    const hasApiKey = !!process.env.AZURE_OPENAI_KEY;

    if (!hasAzureAD && !hasApiKey) {
      throw new Error(
        "No Azure authentication method configured. Either set AZURE_OPENAI_KEY for API key authentication, or set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_ACCESS_SCOPE for Azure AD authentication."
      );
    }

    this.apiVersion = "2024-12-01-preview";
    
    // Configure authentication
    let authConfig = {
      apiVersion: this.apiVersion,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    };

    if (hasAzureAD) {
      // Use Azure AD authentication
      const { DefaultAzureCredential, getBearerTokenProvider, ClientSecretCredential } = require("@azure/identity");
      
      let credential;
      if (process.env.AZURE_CLIENT_SECRET) {
        // Use Client Secret credential for service principal authentication
        credential = new ClientSecretCredential(
          process.env.AZURE_TENANT_ID,
          process.env.AZURE_CLIENT_ID,
          process.env.AZURE_CLIENT_SECRET
        );
      } else {
        // Use Default Azure credential for managed identity or other methods
        credential = new DefaultAzureCredential();
      }

      const scope = process.env.AZURE_ACCESS_SCOPE || "https://cognitiveservices.azure.com/.default";
      const azureADTokenProvider = getBearerTokenProvider(credential, scope);
      authConfig.azureADTokenProvider = azureADTokenProvider;
      
      this.log("Using Azure AD authentication");
    } else {
      // Use API key authentication
      authConfig.apiKey = process.env.AZURE_OPENAI_KEY;
      this.log("Using API key authentication");
    }

    const openai = new AzureOpenAI(authConfig);

    // We cannot assume the model fallback since the model is based on the deployment name
    // and not the model name - so this will throw on embedding if the model is not defined.
    this.model = process.env.EMBEDDING_MODEL_PREF;
    this.openai = openai;

    // Limit of how many strings we can process in a single pass to stay with resource or network limits
    // https://learn.microsoft.com/en-us/azure/ai-services/openai/faq#i-am-trying-to-use-embeddings-and-received-the-error--invalidrequesterror--too-many-inputs--the-max-number-of-inputs-is-1---how-do-i-fix-this-:~:text=consisting%20of%20up%20to%2016%20inputs%20per%20API%20request
    this.maxConcurrentChunks = 16;

    // https://learn.microsoft.com/en-us/answers/questions/1188074/text-embedding-ada-002-token-context-length
    this.embeddingMaxChunkLength = 2048;
  }

  log(text, ...args) {
    console.log(`\x1b[36m[AzureOpenAiEmbedder]\x1b[0m ${text}`, ...args);
  }

  async embedTextInput(textInput) {
    const result = await this.embedChunks(
      Array.isArray(textInput) ? textInput : [textInput]
    );
    return result?.[0] || [];
  }

  async embedChunks(textChunks = []) {
    if (!this.model) throw new Error("No Embedding Model preference defined.");

    this.log(`Embedding ${textChunks.length} chunks...`);
    // Because there is a limit on how many chunks can be sent at once to Azure OpenAI
    // we concurrently execute each max batch of text chunks possible.
    // Refer to constructor maxConcurrentChunks for more info.
    const embeddingRequests = [];
    for (const chunk of toChunks(textChunks, this.maxConcurrentChunks)) {
      embeddingRequests.push(
        new Promise((resolve) => {
          this.openai.embeddings
            .create({
              model: this.model,
              input: chunk,
            })
            .then((res) => {
              resolve({ data: res.data, error: null });
            })
            .catch((e) => {
              e.type =
                e?.response?.data?.error?.code ||
                e?.response?.status ||
                "failed_to_embed";
              e.message = e?.response?.data?.error?.message || e.message;
              resolve({ data: [], error: e });
            });
        })
      );
    }

    const { data = [], error = null } = await Promise.all(
      embeddingRequests
    ).then((results) => {
      // If any errors were returned from Azure abort the entire sequence because the embeddings
      // will be incomplete.
      const errors = results
        .filter((res) => !!res.error)
        .map((res) => res.error)
        .flat();
      if (errors.length > 0) {
        let uniqueErrors = new Set();
        errors.map((error) =>
          uniqueErrors.add(`[${error.type}]: ${error.message}`)
        );

        return {
          data: [],
          error: Array.from(uniqueErrors).join(", "),
        };
      }
      return {
        data: results.map((res) => res?.data || []).flat(),
        error: null,
      };
    });

    if (!!error) throw new Error(`Azure OpenAI Failed to embed: ${error}`);
    return data.length > 0 &&
      data.every((embd) => embd.hasOwnProperty("embedding"))
      ? data.map((embd) => embd.embedding)
      : null;
  }
}

module.exports = {
  AzureOpenAiEmbedder,
};
