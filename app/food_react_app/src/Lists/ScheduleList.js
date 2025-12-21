import {
  Datagrid, Edit, EditButton, List, NumberField, NumberInput,
  SimpleForm, TextField, TextInput, Show, SimpleShowLayout,
  ShowButton, DeleteButton, Create, CreateButton, TopToolbar,
  ExportButton
} from "react-admin";

//bot
const ScheduleListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

//stor
export const ScheduleList = (props) => (
  <List {...props} actions={<ScheduleListActions />}>
    <Datagrid>
      <NumberField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <ShowButton />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

//bot
export const ScheduleShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <NumberField source="id" />
      <TextField source="name" />
      <TextField source="description" />
    </SimpleShowLayout>
  </Show>
);

//stor
export const ScheduleEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="description" />
    </SimpleForm>
  </Edit>
);

//stor
export const ScheduleCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="description" />
    </SimpleForm>
  </Create>
);