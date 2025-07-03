import { useState } from "react";

export default function AzureAiOptions({ settings }) {
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
    <div className="w-full flex flex-col gap-y-4">
      {/* Authentication Method Selection */}
      <div className="w-full flex items-center gap-[36px] mt-1.5">
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
      <div className="w-full flex items-center gap-[36px] mt-1.5">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Azure Service Endpoint
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
              API Key
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
            Embedding Deployment Name
          </label>
          <input
            type="text"
            name="AzureOpenAiEmbeddingModelPref"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Azure OpenAI embedding model deployment name"
            defaultValue={settings?.AzureOpenAiEmbeddingModelPref}
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
                placeholder="67bff79e-7f91-4433-a8e5-c9252d2ddc1d"
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
                placeholder="76005846-e2ee-410e-885e-e986f9e37135"
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
                placeholder="DTd8Q~8WMHqH~gM0cVAUu6ndT1dqvzlo_uCDUdyD"
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
    </div>
  );
}
