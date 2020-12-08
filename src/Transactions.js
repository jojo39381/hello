import React, { useState } from "react";
import "./App.css";
import {
  List,
  Datagrid,
  TextField,
  SelectInput,
  TextInput,
  SimpleForm,
  Create,
  ReferenceInput,
  DateInput,
  AutocompleteInput,
  SimpleList,
  NumberField,
  BooleanInput,
  FormDataConsumer,
  NumberInput,
  useGetList,
  PasswordInput,
  downloadCSV,
  Filter,
} from "react-admin";
import { useMediaQuery } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import jsonExport from "jsonexport/dist";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";

// Non custom Validations
const required = (message = "Required") => (value) =>
  value ? undefined : message;
const number = (message = "Must be a number") => (value) =>
  value && isNaN(Number(value)) ? message : undefined;

const StoresFetchedTextField = ({ record, source }) => {
  const { data, loaded } = useGetList("stores", {
    page: 1,
    perPage: 10000,
  });
  if (!loaded) return <span>Loading</span>;
  try {
    let resp = data[record[source]];
    return <span>{resp[source]}</span>;
  } catch (error) {
    return <span>{record[source]}</span>;
  }
};
const BudtendersFetchedTextField = ({ record, source }) => {
  const { data, loaded } = useGetList("budtenders", {
    page: 1,
    perPage: 10000,
  });
  if (!loaded) return <span>Loading</span>;

  try {
    let resp = data[record[source]];
    return <span>{resp[source]}</span>;
  } catch (error) {
    return <span>{record[source]}</span>;
  }
};
const DebitOrCreditField = ({ record, source }) => {
  if (record[source] === undefined || record[source] === false) {
    return <span /*style={{ color: "#3b7d40" }}*/>- charged</span>;
  } else {
    return <span /*style={{ color: "#9c0b0b" }}*/>+ funds</span>;
  }
};

const CardFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput source="cardID" reference="cards" label="Card ID">
      <AutocompleteInput
        reference="transactions"
        optionText="id"
        optionValue="id"
      />
    </ReferenceInput>
    
      <DateInput source="startDate" reference="cards" optionValue="id" label="Start date" />
      <DateInput source="endDate" reference="cards" optionValue="id" label="End date" />
    <ReferenceInput source="budtender_name" reference="budtenders" label="Budtenders" >
      <AutocompleteInput
        reference="budtenders"
        optionText="budtender_name"
       
      />
    </ReferenceInput>
    <ReferenceInput source="store_name" reference="stores" label="Store Name" >
      <AutocompleteInput
        reference="stores"
        optionText="store_name"
       
      />
    </ReferenceInput>
  
    {/* <ReferenceInput source="startDate" reference="cards" label="Dates" alwaysOn>
        <DateInput source="startDate" label="Start date"  />
      </ReferenceInput>
      <ReferenceInput source="endDate" reference="cards" label="Dates" alwaysOn>
        <DateInput source="endDate" label="End Date"  />
      </ReferenceInput> */}
  </Filter>
);

const exporter = (records, fetchRelatedRecords) => {
  // will call dataProvider.getMany('posts', { ids: records.map(record => record.post_id) }), ignoring duplicate and empty post_id
  fetchRelatedRecords(records, "store_name", "stores").then((stores) => {
    const data = records.map((record) => ({
      datetime: record.datetime,
      amount: record.isAdded ? `+${record.amount}` : `-${record.amount}`,
      budtender_name: record.budtender_name,
      cardID: record.cardID,
      store_name: stores[record.store_name].store_name,
      id: record.id,
    }));

    fetchRelatedRecords(data, "budtender_name", "budtenders").then(
      (budtenders) => {
        const finalData = data.map((record) => ({
          ...record,
          budtender_name: budtenders[record.budtender_name].budtender_name,
        }));

        jsonExport(finalData, (err, csv) => {
          downloadCSV(csv, "transactions");
        });
      }
    );
  });
};

export const TransactionList = (props) => {
  
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <List filters={<CardFilter />} exporter={exporter} {...props}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `Transaction ${record.id}`}
          secondaryText={(record) => `$${record.amount}`}
          tertiaryText={(record) => `${record.datetime}`}
        />
      ) : (
        <Datagrid>
          <TextField source="id" />
          <NumberField
            source="amount"
            options={{ style: "currency", currency: "USD" }}
          />
          <DebitOrCreditField source="isAdded" />
          <StoresFetchedTextField source="store_name" />
          <BudtendersFetchedTextField source="budtender_name" />
          <TextField source="datetime" />
          <TextField source="cardID" />
          {/* <EditButton /> // uncomment this line to allow transactions to be editable */}
        </Datagrid>
      )}
    </List>
  );
};

export const TransactionCreate = (props) => {
  const { data, loaded } = useGetList("budtenders", {
    page: 1,
    perPage: 10000,
  });
  const { data: cardData, loaded: cardLoaded } = useGetList("cards", {
    page: 1,
    perPage: 10000,
  });
  const [transactionIsAdded, setTransactionIsAdded] = useState(false);
  const [stepOneCompleted, setStepOneCompleted] = useState(false);

  const pinValidation = (value, allValues) => {
    if (!loaded) return "incorrect pin";
    let matchedPin = "";
    Object.keys(data).forEach((e) => {
      if (data[e].id === allValues.budtender_name) {
        matchedPin = data[e].pin;
      }
    });
    if (matchedPin === value) {
      return undefined;
    } else {
      return "incorrect pin";
    }
  };

  const valueValidation = (value, allValues) => {
    if (!loaded || !cardLoaded) return "insufficient funds";
    let matchedCard = undefined;
    Object.keys(cardData).forEach((e) => {
      if (cardData[e].id === allValues.cardID) {
        matchedCard = cardData[e];
      }
    });
    if (matchedCard === undefined) return undefined;

    if (allValues?.isAdded === undefined || allValues.isAdded === false) {
      if (matchedCard.amount - value < 0) return "insufficient funds";
    }
    return undefined;
  };

  const cardPinValidation = (value, allValues) => {
    if (!cardLoaded) return "incorrect pin";
    let matchedPin = "";
    Object.keys(cardData).forEach((e) => {
      if (cardData[e].id === allValues.cardID) {
        matchedPin = cardData[e].pin;
      }
    });
    if (matchedPin === value) {
      return undefined;
    } else {
      return "incorrect pin";
    }
  };

  const validatePin = [pinValidation, required(), number()];
  const validateAmount = [valueValidation, required(), number()];
  const validateCardPin = [cardPinValidation, required()];

  const getBudtendersPerStore = (store_name) => {
    let choices = [];
    Object.keys(data).forEach((el) => {
      let element = data[el];
      if (element.stores.includes(store_name)) {
        choices.push({
          id: element.id,
          key: element.id,
          name: element.budtender_name,
        });
      }
    });
    return choices;
  };

  return (
    <>
      {!stepOneCompleted ? (
        <div>
          <p>What type of transaction?</p>
          <ButtonGroup variant="contained" color="primary">
            <Button
              size="large"
              onClick={() => {
                setTransactionIsAdded(true);
                setStepOneCompleted(true);
              }}
            >
              Add Funds
            </Button>
            <Button
              size="large"
              onClick={() => {
                setTransactionIsAdded(false);
                setStepOneCompleted(true);
              }}
            >
              Charge Card
            </Button>
          </ButtonGroup>
        </div>
      ) : (
        <Create {...props}>
          <SimpleForm redirect="list">
            <ReferenceInput
              source="store_name"
              reference="stores"
              label="store"
            >
              <SelectInput optionText="store_name" validate={required()} />
            </ReferenceInput>

            <FormDataConsumer>
              {({ formData, ...rest }) => {
                return (
                  formData.store_name && (
                    <SelectInput
                      source="budtender_name"
                      optionText="name"
                      optionValue="id"
                      choices={getBudtendersPerStore(formData.store_name)}
                      {...rest}
                    />
                  )
                );
              }}
            </FormDataConsumer>
            <FormDataConsumer>
              {({ formData, ...rest }) => {
                if (
                  formData.store_name !== undefined &&
                  formData.budtender_name !== undefined
                ) {
                  return (
                    <PasswordInput
                      source="pin"
                      validate={validatePin}
                      {...rest}
                    />
                  );
                }
              }}
            </FormDataConsumer>
            
            <ReferenceInput source="cardID" reference="cards" label="Card">
              <AutocompleteInput validate={required()} optionText="id" />
            </ReferenceInput>
            <TextInput
              source="externalID"
              validate={required()}
              label="Treez ID"
            />
            <FormDataConsumer>
              {({ formData, ...rest }) => {
                if (formData.cardID !== undefined) {
                  let matchedCard = Object.keys(cardData).find(
                    (e) => cardData[e].id === formData.cardID
                  );
                  if (cardData[matchedCard] !== undefined) {
                    return (
                      <>
                        <p>{`$${
                          formData.isAdded
                            ? cardData[matchedCard].amount +
                              Number(formData.amount || 0)
                            : cardData[matchedCard].amount -
                              Number(formData.amount || 0)
                        } remaining`}</p>
                        <BooleanInput
                          label={
                            formData.isAdded ? "Adding Funds" : "Charging Card"
                          }
                          source="isAdded"
                          defaultValue={transactionIsAdded}
                          disabled
                          // validate={required()}
                          options={{ checkedIcon: <AddCircleIcon /> }}
                        />
                        <NumberInput
                          source="amount"
                          validate={validateAmount}
                          {...rest}
                        />
                      </>
                    );
                  }
                }
              }}
            </FormDataConsumer>

            <FormDataConsumer>
              {({ formData, ...rest }) => {
                if (formData.cardID !== undefined) {
                  return (
                    <>
                      {transactionIsAdded ? (
                        <></>
                      ) : (
                        <TextInput
                          source="cardPin"
                          validate={validateCardPin}
                          {...rest}
                        />
                      )}
                    </>
                  );
                }
              }}
            </FormDataConsumer>
            <TextInput
              source="datetime"
              initialValue={`${String(new Date())}`}
              disabled
            />
          </SimpleForm>
        </Create>
      )}
    </>
  );
};
