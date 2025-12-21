import { Admin, Resource } from "react-admin";
import lb4Provider from "react-admin-lb4";
import { LessonList, LessonEdit, LessonShow, LessonCreate } from "./Lists/LessonList.js";
import { ScheduleList, ScheduleEdit, ScheduleShow, ScheduleCreate } from "./Lists/ScheduleList.js";
import Dashboard from "./dashboard";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const dataProvider = lb4Provider("http://localhost:3000");

const App = () => (
  <Admin dashboard={Dashboard} dataProvider={dataProvider}>
    <Resource
      name="schedules"
      icon={CalendarMonthIcon}
      list={ScheduleList}
      edit={ScheduleEdit}
      show={ScheduleShow}
      create={ScheduleCreate}
    />
    <Resource
      name="lessons"
      icon={CastForEducationIcon}
      list={LessonList}
      edit={LessonEdit}
      show={LessonShow}
      create={LessonCreate}
    />
  </Admin>
);

export default App;