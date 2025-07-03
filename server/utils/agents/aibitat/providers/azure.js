const { AzureOpenAI } = require("openai");
const Provider = require("./ai-provider.js");
const { RetryError } = require("../error.js");

/**
 * The agent provider for the Azure OpenAI API.
 */
class AzureOpenAiProvider extends Provider {
  model;

  constructor(config = { model: null }) {
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

    // Configure authentication
    let authConfig = {
      apiVersion: "2024-12-01-preview",
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
    } else {
      // Use API key authentication
      authConfig.apiKey = process.env.AZURE_OPENAI_KEY;
    }

    const client = new AzureOpenAI(authConfig);
    super(client);
    this.model = config.model ?? process.env.OPEN_MODEL_PREF;
    this.verbose = true;
  }
  /**
   * Create a completion based on the received messages.
   *
   * @param messages A list of messages to send to the OpenAI API.
   * @param functions
   * @returns The completion.
   */
  async complete(messages, functions = []) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        // stream: true,
        messages,
        ...(Array.isArray(functions) && functions?.length > 0
          ? { functions }
          : {}),
      });

      // Right now, we only support one completion,
      // so we just take the first one in the list
      const completion = response.choices[0].message;
      const cost = this.getCost(response.usage);
      // treat function calls
      if (completion.function_call) {
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(completion.function_call.arguments);
        } catch (error) {
          // call the complete function again in case it gets a json error
          return this.complete(
            [
              ...messages,
              {
                role: "function",
                name: completion.function_call.name,
                function_call: completion.function_call,
                content: error?.message,
              },
            ],
            functions
          );
        }

        // console.log(completion, { functionArgs })
        return {
          result: null,
          functionCall: {
            name: completion.function_call.name,
            arguments: functionArgs,
          },
          cost,
        };
      }

      return {
        result: completion.content,
        cost,
      };
    } catch (error) {
      // If invalid Auth error we need to abort because no amount of waiting
      // will make auth better.
      if (error instanceof AzureOpenAI.AuthenticationError) throw error;

      if (
        error instanceof AzureOpenAI.RateLimitError ||
        error instanceof AzureOpenAI.InternalServerError ||
        error instanceof AzureOpenAI.APIError // Also will catch AuthenticationError!!!
      ) {
        throw new RetryError(error.message);
      }

      throw error;
    }
  }

  /**
   * Get the cost of the completion.
   * Stubbed since Azure OpenAI has no public cost basis.
   *
   * @param _usage The completion to get the cost for.
   * @returns The cost of the completion.
   */
  getCost(_usage) {
    return 0;
  }
}

module.exports = AzureOpenAiProvider;
