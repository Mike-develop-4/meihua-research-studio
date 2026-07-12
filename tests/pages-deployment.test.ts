import { describe, expect, it } from 'vitest'
import workflow from '../.github/workflows/deploy-pages.yml?raw'

describe('GitHub Pages 发布配置', () => {
  it('使用仓库子路径构建并通过 Pages 工作流发布', () => {
    expect(workflow).toContain('npm run build -- --base /meihua-research-studio/')
    expect(workflow).toContain('pages: write')
    expect(workflow).toContain('id-token: write')
    expect(workflow).toContain('actions/deploy-pages@v4')
  })
})
