import { Stack, createListCollection, Input } from '@chakra-ui/react'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@components/ui/select'
import { toaster, Toaster } from '@components/ui/toaster'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo, useState } from 'react'

export function CourseSelector({ onSelect }) {
  const [search, setSearch] = useState('')
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
          withCredentials: true
        })
        return response.data
      } catch (error) {
        if (error.response?.status === 429) {
          // const retryAfter = error.response.headers['x-ratelimit-reset']
          // const retryAfterMinutes = Math.ceil(retryAfter / 60)
          toaster.create({
            title: 'rate limit exceeded',
            // description: 'course selector',
            // description: `too many requests. try again in ${retryAfterMinutes} minutes`,
            type: 'error',
            duration: 5000,
          })
        }
        throw error
      }
    },
    retry: false
  })

  const filteredCourses = useMemo(() => {
    if (!courses) return []
    return courses.filter(course => 
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.id_sem.toLowerCase().includes(search.toLowerCase())
    )
  }, [courses, search])

  const courseCollection = useMemo(() => {
    return createListCollection({
      items: filteredCourses,
      itemToString: (item) => item.name,
      itemToValue: (item) => item.id_sem
    })
  }, [filteredCourses])

  return (
    <Stack gap="5">
      <SelectRoot
        size="md"
        collection={courseCollection}
        onValueChange={ (c) => onSelect(c?.value[0]) }
        disabled={isLoading}
        variant="subtle"
        className='dark'
      >
        <SelectTrigger>
          <SelectValueText placeholder="select course" />
        </SelectTrigger>
        <SelectContent
          bg="gray.800"
          borderColor="gray.700"
          borderRadius="lg"
          boxShadow="0 4px 8px -1px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)"
          // _dark={{
          //   bg: "gray.900",
          //   borderColor: "blue.600"
          // }}
        >
          <Input
            placeholder="search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={2}
            borderRadius="md"
            size="sm"
            variant={'subtle'}
            className='dark'
          />
          {courseCollection.items.map(course => (
            <SelectItem
              item={course}
              key={course.id_sem}
              px={3}
              py={2}
              cursor="pointer"
            >
              <Stack gap={0}>
                <span>{course.name}</span>
                <span style={{ fontSize: '0.8em', opacity: 0.8 }}>{course.id_sem.split("_")[0]}&nbsp;&nbsp;•&nbsp;&nbsp;{course.id_sem.split("_")[1]}</span>
              </Stack>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </Stack>
  )
}