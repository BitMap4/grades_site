'use client'

import { For, SegmentGroup } from '@chakra-ui/react'
import * as React from 'react'

function normalize(items) {
  return items.map((item) => {
    if (typeof item === 'string') return { value: item, label: item }
    return item
  })
}

export const SegmentedControl = React.forwardRef(
  function SegmentedControl(props, ref) {
    const { items, ...rest } = props
    const data = React.useMemo(() => normalize(items), [items])

    return (
      <SegmentGroup.Root ref={ref} {...rest}>
        <SegmentGroup.Indicator />
        <For each={data}>
          {(item) => (
            <SegmentGroup.Item
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              padding={{ base: '0.5rem 0.875rem', sm: '0.5rem 1rem' }}
            >
              <SegmentGroup.ItemText>{item.label}</SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          )}
        </For>
      </SegmentGroup.Root>
    )
  },
)
