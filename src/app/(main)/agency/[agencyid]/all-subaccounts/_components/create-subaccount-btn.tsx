'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';
import { PlusCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import CustomModal from '@/components/global/custom-modal';
import SubAccountDetails from '@/components/forms/subaccount-details';
import { Agency, SubAccount, AgencySidebarOption, User } from '@prisma/client';

type Props = {
  user: User & {
    Agency:
      | (Agency & {
          SubAccount: SubAccount[];
          SideBarOption?: AgencySidebarOption[];
        })
      | null;
  };
  id: string;
  className?: string;
};

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user?.Agency;

  if (!agencyDetails) return null; // Ensure we don't render if agencyDetails is null.

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can manage multiple subaccounts."
          >
            <SubAccountDetails
              agencyDetails={agencyDetails?.id}
              userId={user?.id}
              userName={user?.name}
            />
          </CustomModal>
        );
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  );
};

export default CreateSubaccountButton;
