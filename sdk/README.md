# Kwenta SDK

Note: This document is a work in progress, as the implementation of the Kwenta SDK is still in progress. Interfaces, types and overall structure are subject to change.

# Architecture

The SDK is a collection of multiple classes, objects and functions which can generally be categorized as follows:

## Context

The context class (pending implementation) contains attributes that are used by other classes, especially services (see the section below), to determine what context they are being called in. For example, the context class contains information about the provider, signer, wallet address and network ID.

## Services

Services are collection of methods that function together to enable. We have services for futures, exchange, synths and transactions. A service's methods are available under `sdk.[service-name]`. While services function independently for the most part, they may also call methods on other services.

## Events

In certain situations where the SDK needs to inform a client about data changes (for example, exchange rate updates), we emit events that clients can listen to.

## Contracts

Closely related to the context (see section above), when the network changes, we update a list of available contracts on said network internally, to be used on subsequent contract calls.

## Synths

Similarly to contracts, we maintain a list of synths on the current network, which is used for fetching balances, synth names etc.

# Testing

One of the main benefits of extracting Kwenta's logic into an SDK is the ability to test business logic independently of the UI. The `tests` folder will contain a number of unit and integration tests that will help us remain confident in the functionality of the SDK, as well as our ability to output sensible errors when one or more of our dependencies do not behave as expected. These tests will also be updated frequently as new features are added and bugs are fixed.

# Checklist

The following tasks are expected to be completed before the SDK can be considered feature-complete. This list will likely grow as new features are added.

## General

- [ ] Remove code that refers to `@synthetixio/*` packages.
- [x] Add contract typings.
- [x] Implement `Context` class.
- [ ] Cache redux state and hydrate on load
- [ ] Ensure type correctness of all SDK methods.
- [ ] Set up foundation for retries on select methods.
- [ ] Set up service for interacting with our subgraphs.
- [ ] Remove Duplicated types and move most data types to sdk.
- [ ] Cache contract data where possible, especially settings, config etc which doesn't change very often
- [ ] Create a contracts class in sdk context where we can cache more dynamic contracts such as markets
- [ ] Ensure types are added to all redux actions and reducers
- [ ] Remove old unused code
- [ ] Ensure consistent logic patterns across various pages, sdk states and services
- [ ] Ensure all data is correctly refetched after some mutation e.g. polling for contract and subgraph changes after a transaction
- [ ] Consider experimenting with WebSockets for realtime data (again).
- [ ] Remove walletAddress from connector and change references to the redux state wallet, this means we're always taking the sdk as source of truth for the wallet and avoids race conditions where queries are attempted before the signer is set.
- [ ] Add query statuses for all key queries and create derived query statuses for components which rely on completion of multiple queries

## Exchange

- [ ] Refactor `handleExchange` method.
- [ ] Rename quote/base to from/to.
- [ ] Update the write transactions to use the typed calls
- [ ] Ensure all methods use from/to in correct order.
- [ ] Experiment with exchange contexts (store an instance of from/to pairings, so that the client doesn't have to pass it every time).
- [ ] Reduce number of queries, by storing more data in class instance.
- [ ] Write tests for simple functions.
- [ ] Remove duplicate calls in `getSlippagePercent`
- [ ] Consider making the provision of the `txProvider` the client's responsibility. It is a little cumbersome to have to call `this.getTxProvider` in nearly every method.
- [ ] Consider ditching currency keys for simple token addresses. The client can choose to load a token list for UI purposes, but the SDK should not be concerned with such details. For balances, we can fetch them as needed.

## Futures

- [ ] Separate methods for isolated and cross-margin accounts.
- [ ] Implement methods for fetching orders, past trades and transfers from the subgraph.
- [ ] Query cross margin accounts from sdk and cache them there.

# Design Considerations

## General

- It is important to understand that checking if certain context properties are initialized cannot be done directly by checking if the property is undefined. This is because the getter throws an error on attempting to access these values when they are undefined.

## Exchange

## Futures

# Notes

- The `ExchangeService` class is still structured very similarly to the `useExchange` hook. It is important to change this, as they are two different paradigms. Without doing this, it is impossible to be efficient with requests and eliminate the overdependence of certain methods on others.
