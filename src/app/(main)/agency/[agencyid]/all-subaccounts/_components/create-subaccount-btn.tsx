'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';
import { PlusCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import CustomModal from '@/components/global/custom-modal';
import SubAccountDetails from '@/components/forms/subaccount-details';
import { Agency, SubAccount, AgencySidebarOption, User, Subscription } from '@prisma/client';

type Props = {
  user: User & {
    Agency:
      | (Agency & {
          SubAccount: SubAccount[];
          SideBarOption?: AgencySidebarOption[];
          Subscription?: Subscription | null;
        })
      | null;
  };
  id: string;
  className?: string;
};

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user?.Agency;

  if (!agencyDetails) return null;

  const subscriptionPrice = Number(agencyDetails.Subscription?.price || 0);
  const currentSubAccountsCount = agencyDetails.SubAccount.length;

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
              subscriptionPrice={subscriptionPrice}
              currentSubAccountsCount={currentSubAccountsCount}
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
