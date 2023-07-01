import { memo } from 'react'

// Because React.memo does not pass generics along:
export const genericMemo: <T>(component: T) => T = memo
