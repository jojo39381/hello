import React, { useState } from "react";
import { Admin, Resource } from "react-admin";
import LoginPage from "./Login/login";
import "./App.css";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import dataProvider from "./dataProvider";
import StorefrontIcon from "@material-ui/icons/Storefront";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import ReceiptIcon from "@material-ui/icons/Receipt";
import { BudtenderCreate, BudtenderList, BudtenderEdit } from "./Budtender";
import { StoreCreate, StoreList } from "./Stores";
import { CardCreate, CardList, CardEdit } from "./Cards";
import { TransactionCreate, TransactionList } from "./Transactions";
import CotterProvider from "./Login/auth/userProvider";
import { COTTER_API_KEY_ID } from "./apiKeys";
import { authProvider } from "./Login/auth/authProvider";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import agent from "./agent";

const App = () => (
  <CotterProvider apiKeyID={COTTER_API_KEY_ID}>
    <Admin
      loginPage={LoginPage}
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider.dataProvider}
    >
      <Resource
        name="cards"
        list={CardList}
        edit={CardEdit}
        create={CardCreate}
        icon={CreditCardIcon}
      />
      <Resource
        name="transactions"
        list={TransactionList}
        create={TransactionCreate}
        icon={ReceiptIcon}
      />
      <Resource
        name="budtenders"
        list={BudtenderList}
        edit={BudtenderEdit}
        create={BudtenderCreate}
        icon={SupervisedUserCircleIcon}
      />
      <Resource
        name="stores"
        list={StoreList}
        create={StoreCreate}
        // edit={StoreEdit}
        icon={StorefrontIcon}
      />
    </Admin>
  </CotterProvider>
);

export default App;

export const Dashboard = () => {
  const [bulk, setBulk] = useState("");

  const submitBulk = async () => {
    if (bulk === "") {
      return;
    }
    try {
      for (const item of bulk.split("\n")) {
        if (item === "") {
          return;
        }
        let split = item.split(",");
        await agent.Cards.post({
          id: split[0],
          pin: split[1],
          amount: 0,
          isDistributed: false,
        });
      }
      setBulk("");
      alert("Gift cards have been added!");
    } catch (error) {
      console.log(error);
      alert("Please verify gift cards are properly formatted.");
    }
  };

  return (
    <Card>
      <CardHeader title="Welcome to your dashboard!" />
      <CardContent>
        <Grid>
          <p>Bulk Add Gift Cards</p>
          <p>(one per row, comma separated)</p>
          <TextField
            id="standard-multiline-static"
            label="card#,pin"
            multiline
            rows={7}
            variant="outlined"
            defaultValue=""
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
        </Grid>
        <Button variant="outlined" onClick={submitBulk}>
          submit
        </Button>
      </CardContent>
    </Card>
  );
};
