import { User } from 'src/user/schema/user.schema';
import { Slot } from 'src/slots/schema/slots.schema';

export interface PopulatedAppointment {
  _id: string;
  doctorId: User;
  patientId: User;
  slotId: Slot;
  status: string;
}
