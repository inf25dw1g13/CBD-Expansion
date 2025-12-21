import {
  List, Datagrid, TextField, NumberField, DateField, ReferenceField,
  EditButton, Edit, SimpleForm, TextInput, NumberInput, DateInput,
  ReferenceInput, SelectInput, useRecordContext, Show, SimpleShowLayout,
  ShowButton, DeleteButton, Create, CreateButton, TopToolbar, ExportButton
} from "react-admin";

//stor
const PostTitle = () => {
  const record = useRecordContext();
  return record ? <span>Aula "{record.subject}"</span> : null;
};

//stor
const lessonFilters = [
  <TextInput key="subject" label="Search" source="subject" alwaysOn />,
  <ReferenceInput key="scheduleId" label="Schedule" source="scheduleId" reference="schedules">
    <SelectInput optionText="description" />
  </ReferenceInput>
];

//bot
const LessonListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

//stor
export const LessonList = (props) => (
  <List filters={lessonFilters} {...props} actions={<LessonListActions />}>
    <Datagrid>
      <NumberField source="id" />
      <TextField source="subject" />
      <TextField source="course" />
      <NumberField source="year" />
      <TextField source="group" />
      <TextField source="room" />
      <DateField source="date" />
      <TextField source="time" />
      <NumberField source="duration" />
      <ReferenceField source="scheduleId" reference="schedules">
        <TextField source="description" />
      </ReferenceField>
      <ShowButton />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

//bot
export const LessonShow = (props) => (
  <Show title={<PostTitle />} {...props}>
    <SimpleShowLayout>
      <NumberField source="id" />
      <TextField source="subject" />
      <TextField source="course" />
      <NumberField source="year" />
      <TextField source="group" />
      <TextField source="room" />
      <DateField source="date" />
      <TextField source="time" />
      <NumberField source="duration" />
      <ReferenceField source="scheduleId" reference="schedules">
        <TextField source="description" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

//stor
export const LessonEdit = (props) => (
  <Edit title={<PostTitle />} {...props}>
    <SimpleForm>
      <TextInput source="subject" />
      <TextInput source="course" />
      <NumberInput source="year" />
      <TextInput source="group" />
      <TextInput source="room" />
      <DateInput source="date" />
      <TextInput source="time" type="time" />
      <NumberInput source="duration" />
      <ReferenceInput source="scheduleId" reference="schedules">
        <SelectInput optionText="description" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

//stor
export const LessonCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="subject" />
      <TextInput source="course" />
      <NumberInput source="year" />
      <TextInput source="group" />
      <TextInput source="room" />
      <DateInput source="date" />
      <TextInput source="time" type="time" />
      <NumberInput source="duration" />
      <ReferenceInput source="scheduleId" reference="schedules">
        <SelectInput optionText="description" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);