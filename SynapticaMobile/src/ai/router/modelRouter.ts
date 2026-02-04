import {detectComplexity} from './taskComplexity'
import {selectModel} from './routingPolicy'
import {canUseModel} from './costGuard'
import {ModelProfile} from './modelProfiles'

export async function routeModel({
  intent,
  context,
}: {
  intent: string
  context: unknown
}): Promise<{model: ModelProfile; complexity: string}> {
  const complexity = detectComplexity(
    intent,
    JSON.stringify(context).length,
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
