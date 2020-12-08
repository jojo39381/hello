import React, {useState} from "react";
import "./App.css";
import {
  List,
  Datagrid,
  TextField,
  TextInput,
  SimpleForm,
  NumberField,
  DateInput,
  SimpleList,
  Edit,
  EditButton,
  Create,
  Toolbar,
  SaveButton,
  Filter,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import { useMediaQuery } from "@material-ui/core";



export const CardList = (props) => {
  const [startDate, setStartDate] = useState(new Date())
  const CardFilter = (props) => (
    <Filter {...props}>
      <ReferenceInput source="cardID" reference="cards" label="Card ID" alwaysOn>
        <AutocompleteInput reference="cards" optionText="id" optionValue="id" />
      </ReferenceInput>
     
    </Filter>
  );

  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <List filters={<CardFilter />} {...props}>
     
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `Card ${record.id}`}
          secondaryText={(record) => `$${record.amount}`}
        />
      ) : (
       
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <NumberField
            source="amount"
            options={{ style: "currency", currency: "USD" }}
          />
          
          <EditButton />
        </Datagrid>
      ) }
    </List>
  );
};

export const CardTitle = ({ record }) => {
  return <span>Card {record ? `"${record.id}"` : ""}</span>;
};
const EditToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const CardEdit = (props) => {
  return (
    <Edit title={<CardTitle />} {...props}>
      <SimpleForm redirect="list" toolbar={<EditToolbar />}>
        <TextInput source="id" disabled />
        <NumberField source="amount" disabled defaultValue={0} />
        <TextInput source="pin" disabled />
      </SimpleForm>
    </Edit>
  );
};

export const CardCreate = (props) => (
  <Create {...props}>
    <SimpleForm redirect="list">
      <TextInput source="id" />
      <TextInput source="amount" />
      <TextInput source="pin" />
    </SimpleForm>
  </Create>
);
