import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function AzureAiOptions({ settings }) {
  const { t } = useTranslation();
  const [authMethod, setAuthMethod] = useState(() => {
    // Check if Azure AD is configured by looking for actual string values (not just truthy)
    const hasAzureAD = settings?.AzureTenantId && 
                       settings?.AzureClientId && 
                       typeof settings.AzureTenantId === 'string' && 
                       typeof settings.AzureClientId === 'string' &&
                       settings.AzureTenantId !== 'true' &&
                       settings.AzureClientId !== 'true';
    return hasAzureAD ? "azuread" : "apikey";
  });

  return (
    <div className="w-full flex flex-col gap-y-7 mt-1.5">
      {/* Authentication Method Selection */}
      <div className="w-full flex items-center gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Authentication Method
          </label>
          <select
            name="authMethod"
            value={authMethod}
            onChange={(e) => setAuthMethod(e.target.value)}
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            required={true}
          >
            <option value="apikey">API Key Authentication</option>
            <option value="azuread">Azure AD Authentication</option>
          </select>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="w-full flex items-center gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            {t("llm.providers.azure_openai.azure_service_endpoint")}
          </label>
          <input
            type="url"
            name="AzureOpenAiEndpoint"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="https://my-azure.openai.azure.com"
            defaultValue={settings?.AzureOpenAiEndpoint}
            required={true}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {authMethod === "apikey" && (
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-3">
              {t("llm.providers.azure_openai.api_key")}
            </label>
            <input
              type="password"
              name="AzureOpenAiKey"
              className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              placeholder="Azure OpenAI API Key"
              defaultValue={settings?.AzureOpenAiKey ? "*".repeat(20) : ""}
              required={authMethod === "apikey"}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            {t("llm.providers.azure_openai.chat_deployment_name")}
          </label>
          <input
            name="AzureOpenAiModelPref"
            type="text"
            defaultValue={settings?.AzureOpenAiModelPref}
            placeholder="gpt-4, gpt-3.5-turbo"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            required={authMethod === "apikey"}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Azure Deployment Name */}
      <div className="w-full flex items-center gap-[36px] mt-1.5">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Azure Deployment Name
          </label>
          <p className="text-xs leading-[18px] font-base text-white text-opacity-60">
            The name of your model deployment in Azure OpenAI Studio (e.g., "gpt-4-32k-blue")
          </p>
        </div>
        <div className="flex-1">
          <input
            name="AzureOpenAiModel"
            type="text"
            defaultValue={settings?.AzureOpenAiModel}
            placeholder="gpt-4-32k-blue, my-gpt-4-deployment"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            required={true}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Azure AD Authentication Fields */}
      {authMethod === "azuread" && (
        <div className="w-full flex flex-col gap-y-4">
          <div className="w-full flex items-center gap-[36px]">
            <div className="flex flex-col w-60">
              <label className="text-white text-sm font-semibold block mb-3">
                Azure Tenant ID
              </label>
              <input
                type="text"
                name="AzureTenantId"
                className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="to-fill"
                defaultValue={settings?.AzureTenantId}
                required={authMethod === "azuread"}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col w-60">
              <label className="text-white text-sm font-semibold block mb-3">
                Azure Client ID
              </label>
              <input
                type="text"
                name="AzureClientId"
                className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="to-fill"
                defaultValue={settings?.AzureClientId}
                required={authMethod === "azuread"}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col w-60">
              <label className="text-white text-sm font-semibold block mb-3">
                Azure Client Secret
              </label>
              <input
                type="password"
                name="AzureClientSecret"
                className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="to-fill"
                defaultValue={settings?.AzureClientSecret ? "*".repeat(20) : ""}
                required={authMethod === "azuread"}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="w-full flex items-center gap-[36px]">
            <div className="flex flex-col w-60">
              <label className="text-white text-sm font-semibold block mb-3">
                Azure Access Scope
              </label>
              <input
                type="text"
                name="AzureAccessScope"
                className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="https://cognitiveservices.azure.com/.default"
                defaultValue={settings?.AzureAccessScope || "https://cognitiveservices.azure.com/.default"}
                required={authMethod === "azuread"}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex items-center gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            {t("llm.providers.azure_openai.chat_model_token_limit")}
          </label>
          <select
            name="AzureOpenAiTokenLimit"
            defaultValue={settings?.AzureOpenAiTokenLimit || 4096}
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            required={true}
          >
            <option value={4096}>4,096 (gpt-3.5-turbo)</option>
            <option value={16384}>16,384 (gpt-3.5-16k)</option>
            <option value={8192}>8,192 (gpt-4)</option>
            <option value={32768}>32,768 (gpt-4-32k)</option>
            <option value={128000}>
              128,000 (gpt-4-turbo,gpt-4o,gpt-4o-mini,o1-mini)
            </option>
            <option value={200000}>200,000 (o1,o1-pro,o3-mini)</option>
            <option value={1047576}>1,047,576 (gpt-4.1)</option>
          </select>
        </div>

        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            {t("llm.providers.azure_openai.model_type")}
          </label>
          <select
            name="AzureOpenAiModelType"
            defaultValue={settings?.AzureOpenAiModelType || "default"}
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            required={true}
          >
            <option value="default">
              {t("llm.providers.azure_openai.default")}
            </option>
            <option value="reasoning">
              {t("llm.providers.azure_openai.reasoning")}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
