import { Button, Input, VStack, StackSeparator, Text } from '@chakra-ui/react'
import { Field } from '@components/ui/field'
import { Toaster, toaster } from '@components/ui/toaster'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '@contexts/AuthContext'
import { GradeChart } from '@components/GradeChart'

export function GradeInput({ courseId }) {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

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
        <VStack gap={4} align={"flex-start"}>
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
          <Field 
            label="grade" 
            invalid={!!errors.grade}
            errorText={errors.grade?.message}
            required
          >
            <Input
              {...register('grade', {
                required: 'grade is required',
                pattern: {
                  value: /^([A-D]-?|F)$/,
                  message: 'grade must be A, A-, B, B-, C, C-, D, D- or F'
                }
              })}
              placeholder="grade (A/A-/B...)"
            />
          </Field>
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