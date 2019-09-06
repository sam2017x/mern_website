import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import {
  Container,
  Row,
  Col,
  InputGroup,
  Button,
  FormControl,
} from 'react-bootstrap';
import { setNotification } from '../reducers/notification';
import Message from './Message';
import Messages from './Messages';

import {
  GET_CHATROOM_INFO,
  SEND_MSG,
  REMOVE_MESSAGE,
  MESSAGE_SUBSCRIPTION,
} from '../services/queries';

const ChatPage = ({ setNotification, match, me, client }) => {
  const [msg, setMsg] = useState('');

  const scrollRef = React.useRef(null);

  const scrollToMsg = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: {
      id: match.params.id,
    },
    onSubscriptionData: ({ subscriptionData }) => {
      const {
        data: { messageAdded },
      } = subscriptionData;
      const dataInStore = client.readQuery({
        query: GET_CHATROOM_INFO,
        variables: { id: match.params.id },
      });

      if (
        !dataInStore.getChatroomInfo.messages
          .map(msg => msg.id)
          .includes(messageAdded.id)
      ) {
        dataInStore.getChatroomInfo = {
          ...dataInStore.getChatroomInfo,
          messages: dataInStore.getChatroomInfo.messages.concat(messageAdded),
        };
        client.writeQuery({
          query: GET_CHATROOM_INFO,
          variables: { id: match.params.id },
          data: dataInStore,
        });
        scrollToMsg();
      }
    },
  });
  const [sendMsg] = useMutation(SEND_MSG);
  const { data, error, loading } = useQuery(GET_CHATROOM_INFO, {
    variables: {
      id: match.params.id,
    },
  });
  const [removeMessage] = useMutation(REMOVE_MESSAGE);

  const handleRemoveMessage = async id => {
    try {
      const rm = removeMessage({
        variables: {
          id,
        },
      });

      if (!rm.loading) {
        const dataInStore = client.readQuery({
          query: GET_CHATROOM_INFO,
          variables: { id: match.params.id },
        });

        const idArr = dataInStore.getChatroomInfo.messages.map(msg => msg.id);

        const idx = idArr.indexOf(id);

        dataInStore.getChatroomInfo.messages.splice(idx, 1);

        client.writeQuery({
          query: GET_CHATROOM_INFO,
          data: dataInStore,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMessage = async () => {
    try {
      const resp = await sendMsg({
        variables: {
          id: match.params.id,
          message: msg,
          senderId: me.id,
        },
      });

      if (!resp.loading) {
        const dataInStore = client.readQuery({
          query: GET_CHATROOM_INFO,
          variables: { id: match.params.id },
        });
        if (
          !dataInStore.getChatroomInfo.messages
            .map(msg => msg.id)
            .includes(resp.data.sendMessage.id)
        ) {
          dataInStore.getChatroomInfo.messages = dataInStore.getChatroomInfo.messages.concat(
            resp.data.sendMessage
          );
          client.writeQuery({
            query: GET_CHATROOM_INFO,
            data: dataInStore,
          });
        }
        scrollToMsg();
        setMsg('');
      }
    } catch (error) {
      console.log(error);
      //setNotification(`${error.message}`, 'danger', 5);
    }
  };

  if (!me) return null;

  if (loading) return <div style={{ minHeight: '100vh' }}>Loading...</div>;

  if (error) {
    // Could show an image here.
    return (
      <div style={{ minHeight: '100vh' }}>{error.message.substring(14)}</div>
    );
  }

  return (
    <>
      <div style={{ minHeight: '80vh' }}>
        <Container style={{ maxWidth: '50rem' }}>
          <Row
            className="d-flex rounded"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '20px',
              marginTop: '20px',
            }}
          >
            <Col className="text-center rounded">
              <div style={{ display: 'inline-block', float: 'left' }}>
                <strong style={{ color: 'red' }}>
                  {!loading &&
                    data.getChatroomInfo.users.map(user =>
                      user.username !== me.username ? user.username : null
                    )}
                </strong>
              </div>
              <div style={{ display: 'inline-block' }}>
                <h4>Chat</h4>
              </div>
              <div style={{ display: 'inline-block', float: 'right' }}>
                <strong style={{ color: 'blue' }}>{me && me.username}</strong>
              </div>
            </Col>
          </Row>
          <Row
            className="d-flex rounded"
            style={{
              backgroundColor: '#d9d7d7',
              overflowY: 'auto',
              overflowX: 'hidden',
              height: '60vh',
              position: 'relative',
              border: '0.5rem inset #c9a9a7',
              marginTop: '0.5rem',
            }}
            ref={scrollRef}
          >
            {!loading && (
              <Messages
                scrollToMsg={scrollToMsg}
                messages={data.getChatroomInfo.messages}
                removeMessage={handleRemoveMessage}
                me={me}
              />
            )}
          </Row>
        </Container>
        <InputGroup size="sm" className="mt-4 sticky-bottom">
          <InputGroup.Prepend>
            <Button onClick={() => handleMessage()}>Send:</Button>
          </InputGroup.Prepend>
          <FormControl
            value={msg}
            onChange={event => setMsg(event.target.value)}
            as="textarea"
            style={{ resize: 'vertical', maxHeight: '10em', minHeight: '3rem' }}
            aria-label="With textarea"
          />
        </InputGroup>
      </div>
    </>
  );
};

const mapDispatchToProps = {
  setNotification,
};

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(ChatPage)
);
