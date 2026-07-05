export interface PublicDebtLinkPayloadInterface {
  payId: string;
  scope: 'PUBLIC_DEBT_LINK';
}

export interface RequestWithPublicDebtLinkInterface {
  publicDebtLink: {
    payId: string;
  };
}
