import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const PORT = process.env.PORT || 4000;

// eslint-disable-next-line new-cap
const httpLink = new createHttpLink({
  uri: `http://localhost:${PORT}/graphql`,
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:${PORT}/graphql`,
  options: { reconnect: true },
});

const authLink = setContext((_, { headers }) => {
  const token = JSON.parse(localStorage.getItem('loggedUser'));
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token.token}` : null,
    },
  };
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
