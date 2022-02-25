import React, { useState, useEffect } from 'react';

import {
  Alert
} from 'react-bootstrap'

function AlertMessage(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!!props.message || !!props.children)
  }, [props.message, props.children]);

  return (
    <>
      {show &&
      <Alert className="text-center" variant={props.variant || 'danger'} onClose={() => setShow(false)} dismissible>
        {props.message || props.children}
      </Alert>
      }
    </>
  );
}

export default AlertMessage
