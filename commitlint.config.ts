import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'header-max-length': [1, 'always', 100],
        'scope-enum': [
            2,
            'always',
            ['all', 'build', 'deps', 'deploy', 'docs', 'concepts', 'ui', 'website']
        ],
        'scope-case': [2, 'always', 'lowercase']
    }
}

export default config
