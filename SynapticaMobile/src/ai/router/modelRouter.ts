import {detectComplexity} from './taskComplexity'
import {selectModel} from './routingPolicy'
import {canUseModel} from './costGuard'
import {ModelProfile} from './modelProfiles'

export async function routeModel({
  intent,
  contextSize,
}: {
  intent: string
  contextSize?: number
}): Promise<{model: ModelProfile; complexity: string}> {
  const complexity = detectComplexity(
    intent,
    contextSize ?? 0,
  )

  let model = selectModel(complexity)

  if (!canUseModel(model)) {
    model = selectModel('trivial')
  }

  return {
    model,
    complexity,
  }
}
