import React, {useState} from "react";
import "./App.css";
import {
  List,
  Datagrid,
  TextField,
  SelectArrayInput,
  TextInput,
  SimpleForm,
  Edit,
  Create,
  SimpleList,
  ReferenceArrayInput,
  SingleFieldList,
  ReferenceArrayField,
  ChipField,
  Toolbar,
  SaveButton,
} from "react-admin";
import { useMediaQuery } from "@material-ui/core";

export const BudtenderList = (props) => {
  
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <List {...props}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `Transaction ${record.budtender_name}`}
          secondaryText={(record) => `${record.store_name}`}
          tertiaryText={(record) => `${record.pin}`}
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="budtender_name" />
          <ReferenceArrayField
            label="Stores"
            reference="stores"
            source="stores"
          >
            <SingleFieldList>
              <ChipField source="store_name" />
            </SingleFieldList>
          </ReferenceArrayField>
          {/* <EditButton /> */}
        </Datagrid>
      )}
    </List>
  );
};

export const BudtenderCreate = (props) => (
  <Create {...props}>
    <SimpleForm redirect="list">
      <ReferenceArrayInput
        source="stores"
        reference="stores"
        label="store"
        allowNull
      >
        <SelectArrayInput optionText="store_name" />
      </ReferenceArrayInput>
      <TextInput source="budtender_name" />
      <TextInput source="pin" />
    </SimpleForm>
  </Create>
);
const EditToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const BudtenderEdit = (props) => (
  <Edit {...props}>
    <SimpleForm undoable={false} toolbar={<EditToolbar />}>
      <TextInput disabled source="id" />
      <ReferenceArrayInput
        source="stores"
        reference="stores"
        label="store"
        allowNull
      >
        <SelectArrayInput optionText="store_name" />
      </ReferenceArrayInput>
      <TextInput disabled source="budtender_name" />
      <TextInput source="pin" />
    </SimpleForm>
  </Edit>
);
