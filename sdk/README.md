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
