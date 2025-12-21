import { Card, CardHeader, CardContent, Box, Typography } from "@mui/material";
import { useGetList } from "react-admin";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";

export default function Dashboard() {
  const { data: schedules, total: schedulesTotal, isLoading: schedulesLoading } = useGetList('schedules', {
    pagination: { page: 1, perPage: 1000 }, 
  });
  
  const { data: lessons, total: lessonsTotal, isLoading: lessonsLoading } = useGetList('lessons', {
    pagination: { page: 1, perPage: 1000 }, 
  });

  return (
    <Box sx={{ padding: 3 }}>
      <Card sx={{ marginBottom: 3 }}>
        <CardHeader 
          title="Bem-vindo à Administração" 
          sx={{ 
            backgroundColor: '#3f51b5', 
            color: 'white',
            '& .MuiCardHeader-title': {
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }
          }}
        />
        <CardContent>
          <Typography variant="body1" paragraph>
            Sistema de gestão de horários e aulas. Use o menu lateral para navegar entre schedules e lessons.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <CalendarMonthIcon sx={{ fontSize: 40, color: '#3f51b5', marginRight: 2 }} />
              <Typography variant="h6">Schedules</Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {schedulesLoading ? '...' : schedulesTotal || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total de horários
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <CastForEducationIcon sx={{ fontSize: 40, color: '#ff9800', marginRight: 2 }} />
              <Typography variant="h6">Lessons</Typography>
            </Box>
            <Typography variant="h3" sx={{ color: '#ff9800' }}>
              {lessonsLoading ? '...' : lessonsTotal || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total de aulas
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}