<?php
/**
 * PHPMailer simple contact form example.
 * If you want to accept and send uploads in your form, look at the send_file_upload example.
 */

//Import the PHPMailer class into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

require './vendor/autoload.php';

$msg_sent = false;
$form_type = '';
if (array_key_exists('user_message', $_POST)) {
    $err = false;
    $err_msg = '';
    $email = '';

    //Apply some basic validation and filtering to the query
    if (array_key_exists('user_message', $_POST)) {
        //Limit length and strip HTML tags
        $msg= substr(strip_tags($_POST['user_message']), 0, 16384);
    } else {
        $msg = '';
        $err_msg = 'No msg provided!';
        $err = true;
    }

    //Apply some basic validation and filtering to the name
    if (array_key_exists('user_name', $_POST)) {
        //Limit length and strip HTML tags
        $name = substr(strip_tags($_POST['user_name']), 0, 255);
    } else {
        $name = '';
    }

    //Apply some basic validation and filtering to the phone number
    if (array_key_exists('user_phone', $_POST)) {
        //Limit length and strip HTML tags
        $phone_number = substr(strip_tags($_POST['user_phone']), 0, 255);
    } else {
        $phone_number = '';
    }

    //Apply some basic validation and filtering to the phone number
    if (array_key_exists('form_type', $_POST)) {
        $form_type = substr(strip_tags($_POST['form_type']), 0, 255);
    } else {
        $form_type = '';
    }


    //Validate to address
    //Never allow arbitrary input for the 'to' address as it will turn your form into a spam gateway!
    //Substitute appropriate addresses from your own domain, or simply use a single, fixed address
    $to = 'fanfare.krapo@gmail.com';

    //Make sure the address they provided is valid before trying to use it
    if (array_key_exists('user_email', $_POST) && PHPMailer::validateAddress($_POST['user_email'])) {
        $email = $_POST['user_email'];
    } else {
        $err_msg .= 'Error: invalid email address provided';
        $err = true;
    }

    if (array_key_exists('user_extra', $_POST) && !empty($_POST['user_extra'])) {
        $err_msg .= 'Error: bot filled hidden field.';
        $err = true;
        $msg_sent = true; // Fake message was sent
    }

    if (!$err) {
        $mail = new PHPMailer();
        $mail->isSMTP();

        //Enable SMTP debugging
        //SMTP::DEBUG_OFF = off (for production use)
        //SMTP::DEBUG_CLIENT = client messages
        //SMTP::DEBUG_SERVER = client and server messages
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->SMTPDebug = SMTP::DEBUG_OFF;

        // Mail server
        // $mail->Host = 'localhost';
        // $mail->Port = 25;

        // Google 
        $mail->Host = 'smtp.gmail.com';
        // - 465 for SMTP with implicit TLS, a.k.a. RFC8314 SMTPS or
        // - 587 for SMTP+STARTTLS
        // $mail->Port = 465;
        $mail->Port = 587;

        //Set the encryption mechanism to use:
        // - SMTPS (implicit TLS on port 465) or
        // - STARTTLS (explicit TLS on port 587)
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

        //Whether to use SMTP authentication
        $mail->SMTPAuth = true;

        //Username to use for SMTP authentication - use full email address for gmail
        $mail->Username = 'fanfare.krapo@gmail.com';

        //Password to use for SMTP authentication
        // replace by actual password when going in production (see file on Dedikam)
        // do not put the password on github ;-)
        $mail->Password = 'password'; 
        
        $mail->CharSet = PHPMailer::CHARSET_UTF8;

        //It's important not to use the submitter's address as the from address as it's forgery,
        //which will cause your messages to fail SPF checks.
        //Use an address in your own domain as the from address, put the submitter's address in a reply-to
        
        //Note that with gmail you can only use your account address (same as `Username`)
        //or predefined aliases that you have configured within your account.
        //Do not use user-submitted addresses in here

        //Set who the message is to be sent from
        $mail->setFrom('fanfare.krapo@gmail.com', 'Contact - Fanfare Krapo');
        $mail->addAddress($to);
        $mail->addReplyTo($email, $name);
        $mail->Subject = '[' . $form_type . '] ' . $name;
        $mail->Body = "Nom: " . $name;
        $mail->Body .= "\nMail: " . $email;
        if (!empty($phone_number)) {
            $mail->Body .= "\nTéléphone: " . $phone_number;
        }
        $mail->Body .= "\nMessage:\n\n" . $msg;
        if (!$mail->send()) {
            $err_msg .= 'Mailer Error: ' . $mail->ErrorInfo;
        } else {
            $msg_sent = true;
            $err_msg .= 'Message sent !';
        }
    }
}
if (!empty($form_type)) {
    if ($msg_sent) {
        $answer = $form_type . '-acknowledgement.html';
    } else {
        $answer = $form_type . '.html?errmsg=' . $err_msg;
    }
} else {
    $answer = 'index.html';
}
header("Location: " . $answer, TRUE, 303);
echo $err_msg;
exit;
?>
