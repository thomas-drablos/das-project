import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useApiToken } from "../contexts/apiTokenContext";
import {
  Button,
  Modal,
  Toast,
  ToastBody,
  ToastContainer,
} from "react-bootstrap";
import DOMPurify from "dompurify"; // Import DOMPurify

const LinkConsentPopup: React.FC = () => {
  const { logout } = useAuth0();
  const { needsConsent, getConsent, authError } = useApiToken();

  const handleLogout = () => {
    void logout({
      logoutParams: {returnTo: window.location.href}
    });
  };

  return (
    <>
      <Modal show={needsConsent}>
        <Modal.Header>
          <Button variant="outline-info" onClick={handleLogout}>
            Log out
          </Button>
        </Modal.Header>
        <Modal.Body>
          <p>
            We need to link your sign-on with this application. This will open
            in a pop-up window. Please ensure that pop-ups are enabled.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={getConsent}>
            Link account
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-start">
        <Toast show={authError.length > 0}>
          <ToastBody
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(authError) }}
          />
        </Toast>
      </ToastContainer>
    </>
  );
};

export default LinkConsentPopup;
