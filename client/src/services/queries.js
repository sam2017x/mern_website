import { gql } from 'apollo-boost';

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
      username
      id
      friends {
        username
        id
        posts
        level
      }
      level
      posts
    }
  }
`;

export const SIGN = gql`
  mutation sign($username: String!, $password: String!) {
    addUser(username: $username, password: $password) {
      username
      id
    }
  }
`;

export const ALL_USERS = gql`
  {
    allUsers {
      username
      id
      posts
      level
      rooms {
        id
      }
      friends {
        username
        id
      }
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation makeRoom($senderId: String, $receiverId: String, $title: String) {
    createRoom(senderId: $senderId, receiverId: $receiverId, title: $title) {
      users {
        username
        id
      }
      id
      title
    }
  }
`;

export const GET_USER_INFO = gql`
  query getUserInfo($username: String) {
    getUserInfo(username: $username) {
      posts
      username
      level
      id
      friends {
        username
        posts
        level
        id
      }
    }
  }
`;

export const GET_CHATROOM_INFO = gql`
  query getChatroomInfo($id: String) {
    getChatroomInfo(id: $id) {
      id
      users {
        id
        username
      }
      messages {
        message
      }
    }
  }
`;

export const ADD_FRIEND = gql`
  mutation addFriend($id: ID!) {
    addFriend(id: $id) {
      id
      username
      posts
      level
      friends {
        username
        id
        posts
        level
      }
    }
  }
`;

export const SEND_MSG = gql`
  mutation sendMessage($id: String, $message: String) {
    sendMessage(roomId: $id, message: $message) {
      id
      message
      sender {
        id
        username
      }
      timestamp
    }
  }
`;

export const ME = gql`
  {
    me {
      username
      id
      rooms {
        id
      }
      friends {
        username
        id
        posts
        level
      }
      posts
      level
    }
  }
`;
