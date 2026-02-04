type EnvValue = string | undefined

function readEnv(key: string, fallback = ''): string {
  const envSource = typeof process !== 'undefined' ? process.env : undefined
  const value = (envSource?.[key] as EnvValue) ?? fallback
  return value
}

export const AI_ENV = {
  GPT_MODEL: readEnv('GPT_MODEL', 'gpt-4.1-nano'),
  OPENAI_API_KEY: readEnv('OPENAI_API_KEY', ''),
  OPENAI_BASE_URL: readEnv('OPENAI_BASE_URL', 'https://bothub.chat/api/v2/openai/v1'),
}
