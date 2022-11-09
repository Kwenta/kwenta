# Kwenta SDK

Note: This document is a work in progress, as the implementation of the Kwenta SDK is still in progress. Interfaces, types and overall structure are subject to change.

# Architecture

The SDK is a collection of multiple classes, objects and functions which can generally be categorized as follows:

## Context

The context class (pending implementation) contains attributes that are used by other classes, especially services (see the section below), to determine what context they are being called in. For example, the context class contains information about the provider, signer, wallet address and network ID.

## Services

Services are collection of methods that function together to enable. We have services for futures, exchange, synths and transactions. A service's methods are available under `sdk.[service-name]`. While services function independently for the most part, they may also call methods on other services.

## Events

## Contracts

## Synths

# Checklist

The following tasks are expected to be completed before the SDK can be considered feature-complete. This list will likely grow as new features are added.

## General

- [ ] Remove code that refers to `@synthetixio/*` packages.
- [ ] Add contract typings for human-readable ABIs.
- [ ] Implement `Context` class.
- [ ] Ensure type correctness of all SDK methods.

## Exchange

- [ ] Refactor `handleExchange` method.
- [ ] Rename quote/base to from/to.
- [ ] Ensure all methods use from/to in correct order.
- [ ] Experiment with exchange contexts (store an instance of from/to pairings, so that the client doesn't have to pass it every time).
- [ ] Reduce number of queries, by storing more data in class instance.
- [ ] Write tests for simple functions.
- [ ] Remove duplicate calls in `getSlippagePercent`
- [ ] Consider making the provision of the `txProvider` the client's responsibility. It is a little cumbersome to have to call `this.getTxProvider` in nearly every method.
- [ ] Consider ditching currency keys for simple token addresses. The client can choose to load a token list for UI purposes, but the SDK should not be concerned with such details. For balances, we can fetch them as needed.

# Notes

- The `ExchangeService` class is still structured very similarly to the `useExchange` hook. It is important to change this, as they are two different paradigms. Without doing this, it is impossible to be efficient with requests and eliminating the overdependence of certain methods on others.
