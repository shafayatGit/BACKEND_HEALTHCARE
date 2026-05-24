import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const checkExitstingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (checkExitstingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: "Event already processed" };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId as string;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId");
        return {
          message: "Missing appointmentId or paymentId",
        };
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });

      if (!appointment) {
        console.error("Appointment not found");
        return {
          message: "Appointment not found",
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });
        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });

      console.log(
        `Payment checkout.session.completed for appointment ${appointmentId} with paymentId ${paymentId} and status ${session.payment_status}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;

      console.log(
        `Checkout session ${session.id} expired. No further action required.`,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;

      console.log(
        `Payment intent ${session.id} failed. No further action required.`,
      );
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return {
    message: `Event processed successfully ${event.id} `,
  };
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
