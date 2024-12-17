import { Stack, createListCollection } from '@chakra-ui/react'
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@components/ui/select'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'

export function CourseSelector({ onSelect }) {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/courses')
      return response.data
    }
  })

  const courseCollection = useMemo(() => {
    return createListCollection({
      items: courses || [],
      itemToString: (item) => item.name,
      itemToValue: (item) => item.id
    })
  }, [courses])

//   console.log(courseCollection)

  return (
    <Stack gap="5" width="320px">
      <SelectRoot
        size="md"
        collection={courseCollection}
        onValueChange={ (c) => onSelect(c?.value[0]) }
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValueText placeholder="Select course" />
        </SelectTrigger>
        <SelectContent
          bg="gray.800"
          borderColor="gray.700"
          borderRadius="lg"
          boxShadow="lg"
          _dark={{
            bg: "gray.900",
            borderColor: "blue.600"
          }}
        >
          {courseCollection.items.map(course => (
            <SelectItem
              item={course}
              key={course.id}
              // _hover={{ bg: "blue.500" }}
              // _dark={{ 
              //   _hover: { bg: "blue.700" }
              // }}
            >
              {course.name}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </Stack>
  )
}