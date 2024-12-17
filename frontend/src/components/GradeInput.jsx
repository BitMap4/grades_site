import { Button, Input, VStack, StackSeparator, Text } from '@chakra-ui/react'
import { Field } from '@components/ui/field'
import { SegmentedControl } from '@components/ui/segmented-control'
import { Toaster, toaster } from '@components/ui/toaster'
import { useMutation } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '@contexts/AuthContext'
import { GradeChart } from '@components/GradeChart'

const gradeOptions = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'D-', 'F']

export function GradeInput({ courseId }) {
  const { login } = useAuth()
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
      const response = await axios.post('http://localhost:8000/grades', data, {
        withCredentials: true
      })
      return response.data
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        login()
        return
      }
      toaster.create({
        title: 'Error',
        description: error.message,
        type: 'error',
        duration: 3000,
      })
    },
    onSuccess: () => {
      toaster.create({
        title: 'Success',
        description: 'grade submitted',
        type: 'success',
        duration: 3000,
      })
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
            label="course Total" 
            invalid={!!errors.marks}
            errorText={errors.marks?.message}
            required
          >
            <Input
              {...register('marks', { 
                required: 'total marks required',
                min: { value: 0, message: 'marks must be positive (over for u if its actually negative)' },
                max: { value: 100, message: 'marks cannot be more 100 (congrats if they are)' }
              })}
              type="number"
              placeholder="course total"
            />
          </Field>

          <Controller
            control={control}
            name="grade"
            render={({ field }) => (
              <Field
                label="Grade"
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
                />
              </Field>
            )}
          />

          <VStack align={'flex-start'} gap={0} >
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