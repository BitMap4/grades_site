import { Button, Input, VStack, StackSeparator, Text } from '@chakra-ui/react'
import { Field } from '@components/ui/field'
import { SegmentedControl } from '@components/ui/segmented-control'
import { Toaster, toaster } from '@components/ui/toaster'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '@contexts/AuthContext'
import { GradeChart } from '@components/GradeChart'

const gradeOptions = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'D-', 'F']

export function GradeInput({ courseId }) {
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading, login } = useAuth()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      grade: 'F'
    }
  })

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_api_url}/api/grades`, data, {
          withCredentials: true
        })
        return response.data
      } catch (error) {
        throw error
      }
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        login()
        return
      }
      if (error.response?.status === 429) {
        // const retryAfter = error.response.headers['x-ratelimit-reset']
        // const retryAfterSeconds = Math.ceil(retryAfter)
        toaster.create({
          title: 'rate limit exceeded',
          // description: 'grade input',
          // description: `too many requests. try again in ${retryAfterSeconds} seconds`,
          type: 'error',
          duration: 5000,
        })
        return
      }
      toaster.create({
        title: 'error',
        description: error.message,
        type: 'error',
        duration: 3000,
      })
    },
    onSuccess: () => {
      toaster.create({
        title: 'success',
        description: 'grade submitted',
        type: 'success',
        duration: 3000,
      })
      queryClient.invalidateQueries(['grades', courseId])
      reset()
    }
  })

  const onSubmit = handleSubmit((data) => {
    mutation.mutate({
      course_id: courseId,
      total_marks: parseFloat(data.marks),
      grade: data.grade
    })
  })

  return (
    <>
      <form onSubmit={onSubmit}>
        <VStack gap={4} align={"flex-start"} className='dark'>
          <StackSeparator />
          <Text>only 1 grade allowed per user per course. resubmitting will overwrite the previous grade.</Text>
          <Field 
            label="course total" 
            invalid={!!errors.marks}
            errorText={errors.marks?.message}
            required
          >
            <Input
              {...register('marks', { 
                required: 'total marks required',
                min: { value: 0, message: 'marks must be positive (over for u if its actually negative)' },
                max: { value: 100, message: 'marks cannot be more 100' },
                valueAsNumber: true,
              })}
              type="number"
              step={0.01}
              placeholder="course total"
              variant={'subtle'}
            />
          </Field>

          <Controller
            control={control}
            name="grade"
            render={({ field }) => (
              <Field
                label="grade"
                invalid={!!errors.grade}
                errorText={errors.grade?.message}
                required
              >
                <SegmentedControl
                  onBlur={field.onBlur}
                  name={field.name}
                  value={field.value}
                  items={gradeOptions}
                  onValueChange={({ value }) => field.onChange(value)}
                  // className="dark"
                  size={{ base: 'sm', sm: 'md' }}
                />
              </Field>
            )}
          />

          <VStack alignSelf={'center'} gap={0} >
            <Button
              type="submit"
              isLoading={mutation.isPending}
              loadingText="submitting..."
            >
              submit
            </Button>
            <Text fontSize={"xs"}>submissions are anonymous</Text>
          </VStack>
        </VStack>
        <Toaster />
      </form>
      <GradeChart courseId={courseId} />
    </>
  )
}