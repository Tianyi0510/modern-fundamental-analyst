import { ContactEmail } from "../contact-email";
export default function Preview() {
  return (
    <ContactEmail
      locale="en"
      name="Sample Reader"
      email="reader@example.com"
      subject="Research question"
      message={"Thank you for the analysis.\nHow do you evaluate long-term growth?"}
    />
  );
}
