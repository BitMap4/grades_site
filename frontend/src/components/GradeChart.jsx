import { Box, Spinner, Center } from '@chakra-ui/react'
import { Scatter } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'

export function GradeChart({ courseId }) {
  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades', courseId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8000/grades/${courseId}`, {
        withCredentials: true
      })
      return response.data
    }
  })

  useEffect(() => {
    // Cleanup function to destroy chart instance
    return () => {
      const chartInstance = ChartJS.getChart('grades-chart')
      if (chartInstance) {
        chartInstance.destroy()
      }
    }
  }, [courseId])

  if (isLoading) {
    return (
      <Center h="200px">
        <Spinner />
      </Center>
    )
  }

  const chartData = {
    datasets: [{
      label: 'grades distribution',
      data: grades?.map(g => ({
        x: g.total_marks,
        y: gradeToNumber(g.grade)
      })) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      pointStyle: 'line',
      rotation: 90,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBorderWidth: 2
    }]
  }

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        title: { display: true, text: 'grade' },
        ticks: {
          callback: numberToGrade,
          stepSize: 1
        },
        min: 0,
        max: 11,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        title: { display: true, text: 'course total' },
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw
            return `total: ${point.x}, grade: ${numberToGrade(point.y)}`
          }
        }
      }
    }
  }

  return (
    <Box mt={8} p={4} borderRadius="lg" w="100%" h={360} bg="colorPalette.900">
      <Scatter 
        key={courseId}
        id="grades-chart"
        data={chartData} 
        options={options} 
      />
    </Box>
  )
}

// Helper functions for grade conversion
function gradeToNumber(grade) {
  const map = {
    'A': 10, 'A-': 9,
    'B': 8, 'B-': 7,
    'C': 6, 'C-': 5,
    'D': 4, 'D-': 3,
    'F': 0
  }
  return map[grade] || 0
}

function numberToGrade(num) {
  const map = {
    10: 'A', 9: 'A-',
    8: 'B', 7: 'B-',
    6: 'C', 5: 'C-',
    4: 'D', 3: 'D-',
    0: 'F'
  }
  return map[num] || ''
}