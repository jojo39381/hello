import React from "react";
import "./App.css";
import {
  List,
  Datagrid,
  TextField,
  TextInput,
  SimpleForm,
  Edit,
  Create,
  SimpleList,
  Toolbar,
  SaveButton,
} from "react-admin";
import { useMediaQuery } from "@material-ui/core";

export const StoreList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <List {...props}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `${record.store_name}`}
          secondaryText={(record) => `${record.id}`}
          tertiaryText={(record) => `${record.legal_entity}`}
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="store_name" />
          <TextField source="legal_entity" />
          {/* <EditButton /> */}
        </Datagrid>
      )}
    </List>
  );
};

export const StoreCreate = (props) => (
  <Create {...props}>
    <SimpleForm redirect="list">
      <TextInput source="store_name" />
      <TextInput source="legal_entity" />
    </SimpleForm>
  </Create>
);

const StoreTitle = ({ record }) => {
  return <span>Edit Store {record ? `"${record.store_name}"` : ""}</span>;
};
const EditToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const StoreEdit = (props) => (
  <Edit title={<StoreTitle />} {...props}>
    <SimpleForm redirect="list" toolbar={<EditToolbar />}>
      <TextInput source="id" />
      <TextInput source="store_name" />
    </SimpleForm>
  </Edit>
);
