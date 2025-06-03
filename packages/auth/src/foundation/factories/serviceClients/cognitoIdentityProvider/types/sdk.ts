import { MetadataBearer as __MetadataBearer } from '@smithy/types';

declare const AuthFlowType: {
	readonly ADMIN_NO_SRP_AUTH: 'ADMIN_NO_SRP_AUTH';
	readonly ADMIN_USER_PASSWORD_AUTH: 'ADMIN_USER_PASSWORD_AUTH';
	readonly CUSTOM_AUTH: 'CUSTOM_AUTH';
	readonly REFRESH_TOKEN: 'REFRESH_TOKEN';
	readonly REFRESH_TOKEN_AUTH: 'REFRESH_TOKEN_AUTH';
	readonly USER_PASSWORD_AUTH: 'USER_PASSWORD_AUTH';
	readonly USER_SRP_AUTH: 'USER_SRP_AUTH';
};
declare const ChallengeNameType: {
	readonly ADMIN_NO_SRP_AUTH: 'ADMIN_NO_SRP_AUTH';
	readonly CUSTOM_CHALLENGE: 'CUSTOM_CHALLENGE';
	readonly DEVICE_PASSWORD_VERIFIER: 'DEVICE_PASSWORD_VERIFIER';
	readonly DEVICE_SRP_AUTH: 'DEVICE_SRP_AUTH';
	readonly MFA_SETUP: 'MFA_SETUP';
	readonly NEW_PASSWORD_REQUIRED: 'NEW_PASSWORD_REQUIRED';
	readonly PASSWORD_VERIFIER: 'PASSWORD_VERIFIER';
	readonly SELECT_MFA_TYPE: 'SELECT_MFA_TYPE';
	readonly SMS_MFA: 'SMS_MFA';
	readonly SOFTWARE_TOKEN_MFA: 'SOFTWARE_TOKEN_MFA';
};
declare const DeliveryMediumType: {
	readonly EMAIL: 'EMAIL';
	readonly SMS: 'SMS';
};
declare const DeviceRememberedStatusType: {
	readonly NOT_REMEMBERED: 'not_remembered';
	readonly REMEMBERED: 'remembered';
};
declare const VerifySoftwareTokenResponseType: {
	readonly ERROR: 'ERROR';
	readonly SUCCESS: 'SUCCESS';
};
/**
 * @public
 * <p>An Amazon Pinpoint analytics endpoint.</p>
 *          <p>An endpoint uniquely identifies a mobile device, email address, or phone number that
 *             can receive messages from Amazon Pinpoint analytics. For more information about Amazon Web Services Regions that
 *             can contain Amazon Pinpoint resources for use with Amazon Cognito user pools, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-pinpoint-integration.html">Using Amazon Pinpoint analytics with Amazon Cognito user pools</a>.</p>
 */
export interface AnalyticsMetadataType {
	/**
	 * @public
	 * <p>The endpoint ID.</p>
	 */
	AnalyticsEndpointId?: string;
}
/**
 * @public
 *
 * The input for {@link AssociateSoftwareTokenCommand}.
 */
export interface AssociateSoftwareTokenCommandInput
	extends AssociateSoftwareTokenRequest {}
/**
 * @public
 *
 * The output of {@link AssociateSoftwareTokenCommand}.
 */
export interface AssociateSoftwareTokenCommandOutput
	extends AssociateSoftwareTokenResponse,
		__MetadataBearer {}
/**
 * @public
 */
export interface AssociateSoftwareTokenRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose software token you want to
	 *             generate.</p>
	 */
	AccessToken?: string;
	/**
	 * @public
	 * <p>The session that should be passed both ways in challenge-response calls to the
	 *             service. This allows authentication of the user as part of the MFA setup process.</p>
	 */
	Session?: string;
}
/**
 * @public
 */
export interface AssociateSoftwareTokenResponse {
	/**
	 * @public
	 * <p>A unique generated shared secret code that is used in the TOTP algorithm to generate a
	 *             one-time code.</p>
	 */
	SecretCode?: string;
	/**
	 * @public
	 * <p>The session that should be passed both ways in challenge-response calls to the
	 *             service. This allows authentication of the user as part of the MFA setup process.</p>
	 */
	Session?: string;
}
/**
 * @public
 * <p>Specifies whether the attribute is standard or custom.</p>
 */
export interface AttributeType {
	/**
	 * @public
	 * <p>The name of the attribute.</p>
	 */
	Name: string | undefined;
	/**
	 * @public
	 * <p>The value of the attribute.</p>
	 */
	Value?: string;
}
/**
 * @public
 * <p>The authentication result.</p>
 */
export interface AuthenticationResultType {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user who you want to
	 *             authenticate.</p>
	 */
	AccessToken?: string;
	/**
	 * @public
	 * <p>The expiration period of the authentication result in seconds.</p>
	 */
	ExpiresIn?: number;
	/**
	 * @public
	 * <p>The token type.</p>
	 */
	TokenType?: string;
	/**
	 * @public
	 * <p>The refresh token.</p>
	 */
	RefreshToken?: string;
	/**
	 * @public
	 * <p>The ID token.</p>
	 */
	IdToken?: string;
	/**
	 * @public
	 * <p>The new device metadata from an authentication result.</p>
	 */
	NewDeviceMetadata?: NewDeviceMetadataType;
}
/**
 * @public
 *
 * The input for {@link ChangePasswordCommand}.
 */
export interface ChangePasswordCommandInput extends ChangePasswordRequest {}
/**
 * @public
 *
 * The output of {@link ChangePasswordCommand}.
 */
export interface ChangePasswordCommandOutput
	extends ChangePasswordResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to change a user password.</p>
 */
export interface ChangePasswordRequest {
	/**
	 * @public
	 * <p>The old password.</p>
	 */
	PreviousPassword: string | undefined;
	/**
	 * @public
	 * <p>The new password.</p>
	 */
	ProposedPassword: string | undefined;
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose password you want to
	 *             change.</p>
	 */
	AccessToken: string | undefined;
}
/**
 * @public
 * <p>The response from the server to the change password request.</p>
 */
export interface ChangePasswordResponse {}
/**
 * @public
 * <p>The delivery details for an email or SMS message that Amazon Cognito sent for authentication or
 *             verification.</p>
 */
export interface CodeDeliveryDetailsType {
	/**
	 * @public
	 * <p>The email address or phone number destination where Amazon Cognito sent the code.</p>
	 */
	Destination?: string;
	/**
	 * @public
	 * <p>The method that Amazon Cognito used to send the code.</p>
	 */
	DeliveryMedium?: DeliveryMediumType | string;
	/**
	 * @public
	 * <p>The name of the attribute that Amazon Cognito verifies with the code.</p>
	 */
	AttributeName?: string;
}
/**
 * @public
 *
 * The input for {@link ConfirmDeviceCommand}.
 */
export interface ConfirmDeviceCommandInput extends ConfirmDeviceRequest {}
/**
 * @public
 *
 * The output of {@link ConfirmDeviceCommand}.
 */
export interface ConfirmDeviceCommandOutput
	extends ConfirmDeviceResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Confirms the device request.</p>
 */
export interface ConfirmDeviceRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose device you want to
	 *             confirm.</p>
	 */
	AccessToken: string | undefined;
	/**
	 * @public
	 * <p>The device key.</p>
	 */
	DeviceKey: string | undefined;
	/**
	 * @public
	 * <p>The configuration of the device secret verifier.</p>
	 */
	DeviceSecretVerifierConfig?: DeviceSecretVerifierConfigType;
	/**
	 * @public
	 * <p>The device name.</p>
	 */
	DeviceName?: string;
}
/**
 * @public
 * <p>Confirms the device response.</p>
 */
export interface ConfirmDeviceResponse {
	/**
	 * @public
	 * <p>Indicates whether the user confirmation must confirm the device response.</p>
	 */
	UserConfirmationNecessary?: boolean;
}
/**
 * @public
 *
 * The input for {@link ConfirmForgotPasswordCommand}.
 */
export interface ConfirmForgotPasswordCommandInput
	extends ConfirmForgotPasswordRequest {}
/**
 * @public
 *
 * The output of {@link ConfirmForgotPasswordCommand}.
 */
export interface ConfirmForgotPasswordCommandOutput
	extends ConfirmForgotPasswordResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>The request representing the confirmation for a password reset.</p>
 */
export interface ConfirmForgotPasswordRequest {
	/**
	 * @public
	 * <p>The app client ID of the app associated with the user pool.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>A keyed-hash message authentication code (HMAC) calculated using the secret key of a
	 *             user pool client and username plus the client ID in the message. For more information
	 *             about <code>SecretHash</code>, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash">Computing secret hash values</a>.</p>
	 */
	SecretHash?: string;
	/**
	 * @public
	 * <p>The user name of the user for whom you want to enter a code to retrieve a forgotten
	 *             password.</p>
	 */
	Username: string | undefined;
	/**
	 * @public
	 * <p>The confirmation code from your user's request to reset their password. For more
	 *             information, see <a href="https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ForgotPassword.html">ForgotPassword</a>.</p>
	 */
	ConfirmationCode: string | undefined;
	/**
	 * @public
	 * <p>The new password that your user wants to set.</p>
	 */
	Password: string | undefined;
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata for collecting metrics for
	 *                 <code>ConfirmForgotPassword</code> calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool triggers.
	 *             When you use the ConfirmForgotPassword API action, Amazon Cognito invokes the function that is
	 *             assigned to the <i>post confirmation</i> trigger. When Amazon Cognito invokes this
	 *             function, it passes a JSON payload, which the function receives as input. This payload
	 *             contains a <code>clientMetadata</code> attribute, which provides the data that you
	 *             assigned to the ClientMetadata parameter in your ConfirmForgotPassword request. In your
	 *             function code in Lambda, you can process the <code>clientMetadata</code> value to
	 *             enhance your workflow for your specific needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>The response from the server that results from a user's request to retrieve a
 *             forgotten password.</p>
 */
export interface ConfirmForgotPasswordResponse {}
/**
 * @public
 *
 * The input for {@link ConfirmSignUpCommand}.
 */
export interface ConfirmSignUpCommandInput extends ConfirmSignUpRequest {}
/**
 * @public
 *
 * The output of {@link ConfirmSignUpCommand}.
 */
export interface ConfirmSignUpCommandOutput
	extends ConfirmSignUpResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to confirm registration of a user.</p>
 */
export interface ConfirmSignUpRequest {
	/**
	 * @public
	 * <p>The ID of the app client associated with the user pool.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>A keyed-hash message authentication code (HMAC) calculated using the secret key of a
	 *             user pool client and username plus the client ID in the message.</p>
	 */
	SecretHash?: string;
	/**
	 * @public
	 * <p>The user name of the user whose registration you want to confirm.</p>
	 */
	Username: string | undefined;
	/**
	 * @public
	 * <p>The confirmation code sent by a user's request to confirm registration.</p>
	 */
	ConfirmationCode: string | undefined;
	/**
	 * @public
	 * <p>Boolean to be specified to force user confirmation irrespective of existing alias. By
	 *             default set to <code>False</code>. If this parameter is set to <code>True</code> and the
	 *             phone number/email used for sign up confirmation already exists as an alias with a
	 *             different user, the API call will migrate the alias from the previous user to the newly
	 *             created user being confirmed. If set to <code>False</code>, the API will throw an
	 *                 <b>AliasExistsException</b> error.</p>
	 */
	ForceAliasCreation?: boolean;
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata for collecting metrics for <code>ConfirmSignUp</code>
	 *             calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool
	 *             triggers. When you use the ConfirmSignUp API action, Amazon Cognito invokes the function that is
	 *             assigned to the <i>post confirmation</i> trigger. When Amazon Cognito invokes this
	 *             function, it passes a JSON payload, which the function receives as input. This payload
	 *             contains a <code>clientMetadata</code> attribute, which provides the data that you
	 *             assigned to the ClientMetadata parameter in your ConfirmSignUp request. In your function
	 *             code in Lambda, you can process the <code>clientMetadata</code> value to
	 *             enhance your workflow for your specific needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>Represents the response from the server for the registration confirmation.</p>
 */
export interface ConfirmSignUpResponse {}
/**
 * @public
 *
 * The input for {@link DeleteUserCommand}.
 */
export interface DeleteUserCommandInput extends DeleteUserRequest {}
/**
 * @public
 *
 * The output of {@link DeleteUserCommand}.
 */
export interface DeleteUserCommandOutput extends __MetadataBearer {}
/**
 * @public
 * <p>Represents the request to delete a user.</p>
 */
export interface DeleteUserRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose user profile you want to
	 *             delete.</p>
	 */
	AccessToken: string | undefined;
}
/**
 * @public
 * <p>The device verifier against which it is authenticated.</p>
 */
export interface DeviceSecretVerifierConfigType {
	/**
	 * @public
	 * <p>The password verifier.</p>
	 */
	PasswordVerifier?: string;
	/**
	 * @public
	 * <p>The <a href="https://en.wikipedia.org/wiki/Salt_(cryptography)">salt</a>
	 *          </p>
	 */
	Salt?: string;
}
/**
 * @public
 * <p>The device type.</p>
 */
export interface DeviceType {
	/**
	 * @public
	 * <p>The device key.</p>
	 */
	DeviceKey?: string;
	/**
	 * @public
	 * <p>The device attributes.</p>
	 */
	DeviceAttributes?: AttributeType[];
	/**
	 * @public
	 * <p>The creation date of the device.</p>
	 */
	DeviceCreateDate?: Date;
	/**
	 * @public
	 * <p>The date and time, in <a href="https://www.iso.org/iso-8601-date-and-time-format.html">ISO 8601</a> format, when the item was modified.</p>
	 */
	DeviceLastModifiedDate?: Date;
	/**
	 * @public
	 * <p>The date when the device was last authenticated.</p>
	 */
	DeviceLastAuthenticatedDate?: Date;
}
/**
 * @public
 *
 * The input for {@link ForgetDeviceCommand}.
 */
export interface ForgetDeviceCommandInput extends ForgetDeviceRequest {}
/**
 * @public
 *
 * The output of {@link ForgetDeviceCommand}.
 */
export interface ForgetDeviceCommandOutput extends __MetadataBearer {}
/**
 * @public
 * <p>Represents the request to forget the device.</p>
 */
export interface ForgetDeviceRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose registered device you want to
	 *             forget.</p>
	 */
	AccessToken?: string;
	/**
	 * @public
	 * <p>The device key.</p>
	 */
	DeviceKey: string | undefined;
}
/**
 * @public
 *
 * The input for {@link ForgotPasswordCommand}.
 */
export interface ForgotPasswordCommandInput extends ForgotPasswordRequest {}
/**
 * @public
 *
 * The output of {@link ForgotPasswordCommand}.
 */
export interface ForgotPasswordCommandOutput
	extends ForgotPasswordResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to reset a user's password.</p>
 */
export interface ForgotPasswordRequest {
	/**
	 * @public
	 * <p>The ID of the client associated with the user pool.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>A keyed-hash message authentication code (HMAC) calculated using the secret key of a
	 *             user pool client and username plus the client ID in the message.</p>
	 */
	SecretHash?: string;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
	/**
	 * @public
	 * <p>The user name of the user for whom you want to enter a code to reset a forgotten
	 *             password.</p>
	 */
	Username: string | undefined;
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata that contributes to your metrics for
	 *                 <code>ForgotPassword</code> calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool
	 *             triggers. When you use the ForgotPassword API action, Amazon Cognito invokes any
	 *             functions that are assigned to the following triggers: <i>pre sign-up</i>,
	 *                 <i>custom message</i>, and <i>user migration</i>. When
	 *             Amazon Cognito invokes any of these functions, it passes a JSON payload, which the
	 *             function receives as input. This payload contains a <code>clientMetadata</code>
	 *             attribute, which provides the data that you assigned to the ClientMetadata parameter in
	 *             your ForgotPassword request. In your function code in Lambda, you can
	 *             process the <code>clientMetadata</code> value to enhance your workflow for your specific
	 *             needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>The response from Amazon Cognito to a request to reset a password.</p>
 */
export interface ForgotPasswordResponse {
	/**
	 * @public
	 * <p>The code delivery details returned by the server in response to the request to reset a
	 *             password.</p>
	 */
	CodeDeliveryDetails?: CodeDeliveryDetailsType;
}
/**
 * @public
 *
 * The input for {@link GetUserAttributeVerificationCodeCommand}.
 */
export interface GetUserAttributeVerificationCodeCommandInput
	extends GetUserAttributeVerificationCodeRequest {}
/**
 * @public
 *
 * The output of {@link GetUserAttributeVerificationCodeCommand}.
 */
export interface GetUserAttributeVerificationCodeCommandOutput
	extends GetUserAttributeVerificationCodeResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to get user attribute verification.</p>
 */
export interface GetUserAttributeVerificationCodeRequest {
	/**
	 * @public
	 * <p>A non-expired access token for the user whose attribute verification code you want to
	 *             generate.</p>
	 */
	AccessToken: string | undefined;
	/**
	 * @public
	 * <p>The attribute name returned by the server response to get the user attribute
	 *             verification code.</p>
	 */
	AttributeName: string | undefined;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool
	 *             triggers. When you use the GetUserAttributeVerificationCode API action, Amazon Cognito invokes
	 *             the function that is assigned to the <i>custom message</i> trigger. When
	 *             Amazon Cognito invokes this function, it passes a JSON payload, which the function receives as
	 *             input. This payload contains a <code>clientMetadata</code> attribute, which provides the
	 *             data that you assigned to the ClientMetadata parameter in your
	 *             GetUserAttributeVerificationCode request. In your function code in Lambda, you can process the <code>clientMetadata</code> value to enhance your workflow for
	 *             your specific needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>The verification code response returned by the server response to get the user
 *             attribute verification code.</p>
 */
export interface GetUserAttributeVerificationCodeResponse {
	/**
	 * @public
	 * <p>The code delivery details returned by the server in response to the request to get the
	 *             user attribute verification code.</p>
	 */
	CodeDeliveryDetails?: CodeDeliveryDetailsType;
}
/**
 * @public
 *
 * The input for {@link GetUserCommand}.
 */
export interface GetUserCommandInput extends GetUserRequest {}
/**
 * @public
 *
 * The output of {@link GetUserCommand}.
 */
export interface GetUserCommandOutput
	extends GetUserResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to get information about the user.</p>
 */
export interface GetUserRequest {
	/**
	 * @public
	 * <p>A non-expired access token for the user whose information you want to query.</p>
	 */
	AccessToken: string | undefined;
}
/**
 * @public
 * <p>Represents the response from the server from the request to get information about the
 *             user.</p>
 */
export interface GetUserResponse {
	/**
	 * @public
	 * <p>The username of the user that you requested.</p>
	 */
	Username: string | undefined;
	/**
	 * @public
	 * <p>An array of name-value pairs representing user attributes.</p>
	 *          <p>For custom attributes, you must prepend the <code>custom:</code> prefix to the
	 *             attribute name.</p>
	 */
	UserAttributes: AttributeType[] | undefined;
	/**
	 * @public
	 * <p>
	 *             <i>This response parameter is no longer supported.</i> It provides
	 *             information only about SMS MFA configurations. It doesn't provide information about
	 *             time-based one-time password (TOTP) software token MFA configurations. To look up
	 *             information about either type of MFA configuration, use UserMFASettingList
	 *             instead.</p>
	 */
	MFAOptions?: MFAOptionType[];
	/**
	 * @public
	 * <p>The user's preferred MFA setting.</p>
	 */
	PreferredMfaSetting?: string;
	/**
	 * @public
	 * <p>The MFA options that are activated for the user. The possible values in this list are
	 *                 <code>SMS_MFA</code> and <code>SOFTWARE_TOKEN_MFA</code>.</p>
	 */
	UserMFASettingList?: string[];
}
/**
 * @public
 *
 * The input for {@link GlobalSignOutCommand}.
 */
export interface GlobalSignOutCommandInput extends GlobalSignOutRequest {}
/**
 * @public
 *
 * The output of {@link GlobalSignOutCommand}.
 */
export interface GlobalSignOutCommandOutput
	extends GlobalSignOutResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to sign out all devices.</p>
 */
export interface GlobalSignOutRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user who you want to sign out.</p>
	 */
	AccessToken: string | undefined;
}
/**
 * @public
 * <p>The response to the request to sign out all devices.</p>
 */
export interface GlobalSignOutResponse {}
/**
 * @public
 *
 * The input for {@link InitiateAuthCommand}.
 */
export interface InitiateAuthCommandInput extends InitiateAuthRequest {}
/**
 * @public
 *
 * The output of {@link InitiateAuthCommand}.
 */
export interface InitiateAuthCommandOutput
	extends InitiateAuthResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Initiates the authentication request.</p>
 */
export interface InitiateAuthRequest {
	/**
	 * @public
	 * <p>The authentication flow for this call to run. The API action will depend on this
	 *             value. For example:</p>
	 *          <ul>
	 *             <li>
	 *                <p>
	 *                   <code>REFRESH_TOKEN_AUTH</code> takes in a valid refresh token and returns new
	 *                     tokens.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>USER_SRP_AUTH</code> takes in <code>USERNAME</code> and
	 *                         <code>SRP_A</code> and returns the SRP variables to be used for next
	 *                     challenge execution.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>USER_PASSWORD_AUTH</code> takes in <code>USERNAME</code> and
	 *                         <code>PASSWORD</code> and returns the next challenge or tokens.</p>
	 *             </li>
	 *          </ul>
	 *          <p>Valid values include:</p>
	 *          <ul>
	 *             <li>
	 *                <p>
	 *                   <code>USER_SRP_AUTH</code>: Authentication flow for the Secure Remote Password
	 *                     (SRP) protocol.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>REFRESH_TOKEN_AUTH</code>/<code>REFRESH_TOKEN</code>: Authentication
	 *                     flow for refreshing the access token and ID token by supplying a valid refresh
	 *                     token.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>CUSTOM_AUTH</code>: Custom authentication flow.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>USER_PASSWORD_AUTH</code>: Non-SRP authentication flow; user name and
	 *                     password are passed directly. If a user migration Lambda trigger is set, this
	 *                     flow will invoke the user migration Lambda if it doesn't find the user name in
	 *                     the user pool. </p>
	 *             </li>
	 *          </ul>
	 *          <p>
	 *             <code>ADMIN_NO_SRP_AUTH</code> isn't a valid value.</p>
	 */
	AuthFlow: AuthFlowType | string | undefined;
	/**
	 * @public
	 * <p>The authentication parameters. These are inputs corresponding to the
	 *                 <code>AuthFlow</code> that you're invoking. The required values depend on the value
	 *             of <code>AuthFlow</code>:</p>
	 *          <ul>
	 *             <li>
	 *                <p>For <code>USER_SRP_AUTH</code>: <code>USERNAME</code> (required),
	 *                         <code>SRP_A</code> (required), <code>SECRET_HASH</code> (required if the app
	 *                     client is configured with a client secret), <code>DEVICE_KEY</code>.</p>
	 *             </li>
	 *             <li>
	 *                <p>For <code>USER_PASSWORD_AUTH</code>: <code>USERNAME</code> (required),
	 *                         <code>PASSWORD</code> (required), <code>SECRET_HASH</code> (required if the
	 *                     app client is configured with a client secret), <code>DEVICE_KEY</code>.</p>
	 *             </li>
	 *             <li>
	 *                <p>For <code>REFRESH_TOKEN_AUTH/REFRESH_TOKEN</code>: <code>REFRESH_TOKEN</code>
	 *                     (required), <code>SECRET_HASH</code> (required if the app client is configured
	 *                     with a client secret), <code>DEVICE_KEY</code>.</p>
	 *             </li>
	 *             <li>
	 *                <p>For <code>CUSTOM_AUTH</code>: <code>USERNAME</code> (required),
	 *                         <code>SECRET_HASH</code> (if app client is configured with client secret),
	 *                         <code>DEVICE_KEY</code>. To start the authentication flow with password
	 *                     verification, include <code>ChallengeName: SRP_A</code> and <code>SRP_A: (The
	 *                         SRP_A Value)</code>.</p>
	 *             </li>
	 *          </ul>
	 *          <p>For more information about <code>SECRET_HASH</code>, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash">Computing secret hash values</a>. For information about
	 *             <code>DEVICE_KEY</code>, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html">Working with user devices in your user pool</a>.</p>
	 */
	AuthParameters?: Record<string, string>;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for certain custom
	 *             workflows that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool triggers.
	 *             When you use the InitiateAuth API action, Amazon Cognito invokes the Lambda functions that are
	 *             specified for various triggers. The ClientMetadata value is passed as input to the
	 *             functions for only the following triggers:</p>
	 *          <ul>
	 *             <li>
	 *                <p>Pre signup</p>
	 *             </li>
	 *             <li>
	 *                <p>Pre authentication</p>
	 *             </li>
	 *             <li>
	 *                <p>User migration</p>
	 *             </li>
	 *          </ul>
	 *          <p>When Amazon Cognito invokes the functions for these triggers, it passes a JSON payload, which
	 *             the function receives as input. This payload contains a <code>validationData</code>
	 *             attribute, which provides the data that you assigned to the ClientMetadata parameter in
	 *             your InitiateAuth request. In your function code in Lambda, you can process the
	 *                 <code>validationData</code> value to enhance your workflow for your specific
	 *             needs.</p>
	 *          <p>When you use the InitiateAuth API action, Amazon Cognito also invokes the functions for the
	 *             following triggers, but it doesn't provide the ClientMetadata value as input:</p>
	 *          <ul>
	 *             <li>
	 *                <p>Post authentication</p>
	 *             </li>
	 *             <li>
	 *                <p>Custom message</p>
	 *             </li>
	 *             <li>
	 *                <p>Pre token generation</p>
	 *             </li>
	 *             <li>
	 *                <p>Create auth challenge</p>
	 *             </li>
	 *             <li>
	 *                <p>Define auth challenge</p>
	 *             </li>
	 *             <li>
	 *                <p>Verify auth challenge</p>
	 *             </li>
	 *          </ul>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
	/**
	 * @public
	 * <p>The app client ID.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata that contributes to your metrics for
	 *                 <code>InitiateAuth</code> calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
}
/**
 * @public
 * <p>Initiates the authentication response.</p>
 */
export interface InitiateAuthResponse {
	/**
	 * @public
	 * <p>The name of the challenge that you're responding to with this call. This name is
	 *             returned in the <code>AdminInitiateAuth</code> response if you must pass another
	 *             challenge.</p>
	 *          <p>Valid values include the following:</p>
	 *          <note>
	 *             <p>All of the following challenges require <code>USERNAME</code> and
	 *                     <code>SECRET_HASH</code> (if applicable) in the parameters.</p>
	 *          </note>
	 *          <ul>
	 *             <li>
	 *                <p>
	 *                   <code>SMS_MFA</code>: Next challenge is to supply an
	 *                     <code>SMS_MFA_CODE</code>, delivered via SMS.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>PASSWORD_VERIFIER</code>: Next challenge is to supply
	 *                         <code>PASSWORD_CLAIM_SIGNATURE</code>,
	 *                         <code>PASSWORD_CLAIM_SECRET_BLOCK</code>, and <code>TIMESTAMP</code> after
	 *                     the client-side SRP calculations.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>CUSTOM_CHALLENGE</code>: This is returned if your custom authentication
	 *                     flow determines that the user should pass another challenge before tokens are
	 *                     issued.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>DEVICE_SRP_AUTH</code>: If device tracking was activated on your user
	 *                     pool and the previous challenges were passed, this challenge is returned so that
	 *                     Amazon Cognito can start tracking this device.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>DEVICE_PASSWORD_VERIFIER</code>: Similar to
	 *                         <code>PASSWORD_VERIFIER</code>, but for devices only.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>NEW_PASSWORD_REQUIRED</code>: For users who are required to change their
	 *                     passwords after successful first login. </p>
	 *                <p>Respond to this challenge with <code>NEW_PASSWORD</code> and any required
	 *                     attributes that Amazon Cognito returned in the <code>requiredAttributes</code> parameter.
	 *                     You can also set values for attributes that aren't required by your user pool
	 *                     and that your app client can write. For more information, see <a href="https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html">RespondToAuthChallenge</a>.</p>
	 *                <note>
	 *                   <p>In a <code>NEW_PASSWORD_REQUIRED</code> challenge response, you can't modify a required attribute that already has a value.
	 * In <code>RespondToAuthChallenge</code>, set a value for any keys that Amazon Cognito returned in the <code>requiredAttributes</code> parameter,
	 * then use the <code>UpdateUserAttributes</code> API operation to modify the value of any additional attributes.</p>
	 *                </note>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>MFA_SETUP</code>: For users who are required to setup an MFA factor
	 *                     before they can sign in. The MFA types activated for the user pool will be
	 *                     listed in the challenge parameters <code>MFA_CAN_SETUP</code> value. </p>
	 *                <p> To set up software token MFA, use the session returned here from
	 *                         <code>InitiateAuth</code> as an input to
	 *                     <code>AssociateSoftwareToken</code>. Use the session returned by
	 *                         <code>VerifySoftwareToken</code> as an input to
	 *                         <code>RespondToAuthChallenge</code> with challenge name
	 *                         <code>MFA_SETUP</code> to complete sign-in. To set up SMS MFA, an
	 *                     administrator should help the user to add a phone number to their account, and
	 *                     then the user should call <code>InitiateAuth</code> again to restart
	 *                     sign-in.</p>
	 *             </li>
	 *          </ul>
	 */
	ChallengeName?: ChallengeNameType | string;
	/**
	 * @public
	 * <p>The session that should pass both ways in challenge-response calls to the service. If
	 *             the caller must pass another challenge, they return a session with other challenge
	 *             parameters. This session should be passed as it is to the next
	 *                 <code>RespondToAuthChallenge</code> API call.</p>
	 */
	Session?: string;
	/**
	 * @public
	 * <p>The challenge parameters. These are returned in the <code>InitiateAuth</code> response
	 *             if you must pass another challenge. The responses in this parameter should be used to
	 *             compute inputs to the next call (<code>RespondToAuthChallenge</code>). </p>
	 *          <p>All challenges require <code>USERNAME</code> and <code>SECRET_HASH</code> (if
	 *             applicable).</p>
	 */
	ChallengeParameters?: Record<string, string>;
	/**
	 * @public
	 * <p>The result of the authentication response. This result is only returned if the caller
	 *             doesn't need to pass another challenge. If the caller does need to pass another
	 *             challenge before it gets tokens, <code>ChallengeName</code>,
	 *                 <code>ChallengeParameters</code>, and <code>Session</code> are returned.</p>
	 */
	AuthenticationResult?: AuthenticationResultType;
}
/**
 * @public
 *
 * The input for {@link ListDevicesCommand}.
 */
export interface ListDevicesCommandInput extends ListDevicesRequest {}
/**
 * @public
 *
 * The output of {@link ListDevicesCommand}.
 */
export interface ListDevicesCommandOutput
	extends ListDevicesResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to list the devices.</p>
 */
export interface ListDevicesRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose list of devices you want to
	 *             view.</p>
	 */
	AccessToken: string | undefined;
	/**
	 * @public
	 * <p>The limit of the device request.</p>
	 */
	Limit?: number;
	/**
	 * @public
	 * <p>The pagination token for the list request.</p>
	 */
	PaginationToken?: string;
}
/**
 * @public
 * <p>Represents the response to list devices.</p>
 */
export interface ListDevicesResponse {
	/**
	 * @public
	 * <p>The devices returned in the list devices response.</p>
	 */
	Devices?: DeviceType[];
	/**
	 * @public
	 * <p>The pagination token for the list device response.</p>
	 */
	PaginationToken?: string;
}
/**
 * @public
 * <p>
 *             <i>This data type is no longer supported.</i> Applies only to SMS
 *             multi-factor authentication (MFA) configurations. Does not apply to time-based one-time
 *             password (TOTP) software token MFA configurations.</p>
 */
export interface MFAOptionType {
	/**
	 * @public
	 * <p>The delivery medium to send the MFA code. You can use this parameter to set only the
	 *                 <code>SMS</code> delivery medium value.</p>
	 */
	DeliveryMedium?: DeliveryMediumType | string;
	/**
	 * @public
	 * <p>The attribute name of the MFA option type. The only valid value is
	 *                 <code>phone_number</code>.</p>
	 */
	AttributeName?: string;
}
/**
 * @public
 * <p>The new device metadata type.</p>
 */
export interface NewDeviceMetadataType {
	/**
	 * @public
	 * <p>The device key.</p>
	 */
	DeviceKey?: string;
	/**
	 * @public
	 * <p>The device group key.</p>
	 */
	DeviceGroupKey?: string;
}
/**
 * @public
 *
 * The input for {@link ResendConfirmationCodeCommand}.
 */
export interface ResendConfirmationCodeCommandInput
	extends ResendConfirmationCodeRequest {}
/**
 * @public
 *
 * The output of {@link ResendConfirmationCodeCommand}.
 */
export interface ResendConfirmationCodeCommandOutput
	extends ResendConfirmationCodeResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to resend the confirmation code.</p>
 */
export interface ResendConfirmationCodeRequest {
	/**
	 * @public
	 * <p>The ID of the client associated with the user pool.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>A keyed-hash message authentication code (HMAC) calculated using the secret key of a
	 *             user pool client and username plus the client ID in the message.</p>
	 */
	SecretHash?: string;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
	/**
	 * @public
	 * <p>The <code>username</code> attribute of the user to whom you want to resend a
	 *             confirmation code.</p>
	 */
	Username: string | undefined;
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata that contributes to your metrics for
	 *                 <code>ResendConfirmationCode</code> calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool triggers.
	 *             When you use the ResendConfirmationCode API action, Amazon Cognito invokes the function that is
	 *             assigned to the <i>custom message</i> trigger. When Amazon Cognito invokes this
	 *             function, it passes a JSON payload, which the function receives as input. This payload
	 *             contains a <code>clientMetadata</code> attribute, which provides the data that you
	 *             assigned to the ClientMetadata parameter in your ResendConfirmationCode request. In your
	 *             function code in Lambda, you can process the <code>clientMetadata</code> value to enhance
	 *             your workflow for your specific needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>The response from the server when Amazon Cognito makes the request to resend a confirmation
 *             code.</p>
 */
export interface ResendConfirmationCodeResponse {
	/**
	 * @public
	 * <p>The code delivery details returned by the server in response to the request to resend
	 *             the confirmation code.</p>
	 */
	CodeDeliveryDetails?: CodeDeliveryDetailsType;
}
/**
 * @public
 *
 * The input for {@link RespondToAuthChallengeCommand}.
 */
export interface RespondToAuthChallengeCommandInput
	extends RespondToAuthChallengeRequest {}
/**
 * @public
 *
 * The output of {@link RespondToAuthChallengeCommand}.
 */
export interface RespondToAuthChallengeCommandOutput
	extends RespondToAuthChallengeResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>The request to respond to an authentication challenge.</p>
 */
export interface RespondToAuthChallengeRequest {
	/**
	 * @public
	 * <p>The app client ID.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>The challenge name. For more information, see <a href="https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html">InitiateAuth</a>.</p>
	 *          <p>
	 *             <code>ADMIN_NO_SRP_AUTH</code> isn't a valid value.</p>
	 */
	ChallengeName: ChallengeNameType | string | undefined;
	/**
	 * @public
	 * <p>The session that should be passed both ways in challenge-response calls to the
	 *             service. If <code>InitiateAuth</code> or <code>RespondToAuthChallenge</code> API call
	 *             determines that the caller must pass another challenge, they return a session with other
	 *             challenge parameters. This session should be passed as it is to the next
	 *                 <code>RespondToAuthChallenge</code> API call.</p>
	 */
	Session?: string;
	/**
	 * @public
	 * <p>The challenge responses. These are inputs corresponding to the value of
	 *                 <code>ChallengeName</code>, for example:</p>
	 *          <note>
	 *             <p>
	 *                <code>SECRET_HASH</code> (if app client is configured with client secret) applies
	 *                 to all of the inputs that follow (including <code>SOFTWARE_TOKEN_MFA</code>).</p>
	 *          </note>
	 *          <ul>
	 *             <li>
	 *                <p>
	 *                   <code>SMS_MFA</code>: <code>SMS_MFA_CODE</code>, <code>USERNAME</code>.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>PASSWORD_VERIFIER</code>: <code>PASSWORD_CLAIM_SIGNATURE</code>,
	 *                         <code>PASSWORD_CLAIM_SECRET_BLOCK</code>, <code>TIMESTAMP</code>,
	 *                         <code>USERNAME</code>.</p>
	 *                <note>
	 *                   <p>
	 *                      <code>PASSWORD_VERIFIER</code> requires <code>DEVICE_KEY</code> when you
	 *                         sign in with a remembered device.</p>
	 *                </note>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>NEW_PASSWORD_REQUIRED</code>: <code>NEW_PASSWORD</code>,
	 *                         <code>USERNAME</code>, <code>SECRET_HASH</code> (if app client is configured
	 *                     with client secret). To set any required attributes that Amazon Cognito returned as
	 *                         <code>requiredAttributes</code> in the <code>InitiateAuth</code> response,
	 *                     add a <code>userAttributes.<i>attributename</i>
	 *                   </code> parameter.
	 *                     This parameter can also set values for writable attributes that aren't required
	 *                     by your user pool.</p>
	 *                <note>
	 *                   <p>In a <code>NEW_PASSWORD_REQUIRED</code> challenge response, you can't modify a required attribute that already has a value.
	 * In <code>RespondToAuthChallenge</code>, set a value for any keys that Amazon Cognito returned in the <code>requiredAttributes</code> parameter,
	 * then use the <code>UpdateUserAttributes</code> API operation to modify the value of any additional attributes.</p>
	 *                </note>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>SOFTWARE_TOKEN_MFA</code>: <code>USERNAME</code> and
	 *                         <code>SOFTWARE_TOKEN_MFA_CODE</code> are required attributes.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>DEVICE_SRP_AUTH</code> requires <code>USERNAME</code>,
	 *                         <code>DEVICE_KEY</code>, <code>SRP_A</code> (and
	 *                     <code>SECRET_HASH</code>).</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>DEVICE_PASSWORD_VERIFIER</code> requires everything that
	 *                         <code>PASSWORD_VERIFIER</code> requires, plus
	 *                     <code>DEVICE_KEY</code>.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>MFA_SETUP</code> requires <code>USERNAME</code>, plus you must use the
	 *                     session value returned by <code>VerifySoftwareToken</code> in the
	 *                         <code>Session</code> parameter.</p>
	 *             </li>
	 *          </ul>
	 *          <p>For more information about <code>SECRET_HASH</code>, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash">Computing secret hash values</a>. For information about
	 *             <code>DEVICE_KEY</code>, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html">Working with user devices in your user pool</a>.</p>
	 */
	ChallengeResponses?: Record<string, string>;
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata that contributes to your metrics for
	 *                 <code>RespondToAuthChallenge</code> calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool
	 *             triggers. When you use the RespondToAuthChallenge API action, Amazon Cognito invokes any
	 *             functions that are assigned to the following triggers: <i>post
	 *                 authentication</i>, <i>pre token generation</i>,
	 *                 <i>define auth challenge</i>, <i>create auth
	 *                 challenge</i>, and <i>verify auth challenge</i>. When Amazon Cognito
	 *             invokes any of these functions, it passes a JSON payload, which the function receives as
	 *             input. This payload contains a <code>clientMetadata</code> attribute, which provides the
	 *             data that you assigned to the ClientMetadata parameter in your RespondToAuthChallenge
	 *             request. In your function code in Lambda, you can process the
	 *                 <code>clientMetadata</code> value to enhance your workflow for your specific
	 *             needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>The response to respond to the authentication challenge.</p>
 */
export interface RespondToAuthChallengeResponse {
	/**
	 * @public
	 * <p>The challenge name. For more information, see <a href="https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html">InitiateAuth</a>.</p>
	 */
	ChallengeName?: ChallengeNameType | string;
	/**
	 * @public
	 * <p>The session that should be passed both ways in challenge-response calls to the
	 *             service. If the caller must pass another challenge, they return a session with other
	 *             challenge parameters. This session should be passed as it is to the next
	 *                 <code>RespondToAuthChallenge</code> API call.</p>
	 */
	Session?: string;
	/**
	 * @public
	 * <p>The challenge parameters. For more information, see <a href="https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html">InitiateAuth</a>.</p>
	 */
	ChallengeParameters?: Record<string, string>;
	/**
	 * @public
	 * <p>The result returned by the server in response to the request to respond to the
	 *             authentication challenge.</p>
	 */
	AuthenticationResult?: AuthenticationResultType;
}
/**
 * @public
 * <p>The type used for enabling SMS multi-factor authentication (MFA) at the user level.
 *             Phone numbers don't need to be verified to be used for SMS MFA. If an MFA type is
 *             activated for a user, the user will be prompted for MFA during all sign-in attempts,
 *             unless device tracking is turned on and the device has been trusted. If you would like
 *             MFA to be applied selectively based on the assessed risk level of sign-in attempts,
 *             deactivate MFA for users and turn on Adaptive Authentication for the user pool.</p>
 */
export interface SMSMfaSettingsType {
	/**
	 * @public
	 * <p>Specifies whether SMS text message MFA is activated. If an MFA type is activated for a
	 *             user, the user will be prompted for MFA during all sign-in attempts, unless device
	 *             tracking is turned on and the device has been trusted.</p>
	 */
	Enabled?: boolean;
	/**
	 * @public
	 * <p>Specifies whether SMS is the preferred MFA method.</p>
	 */
	PreferredMfa?: boolean;
}
/**
 * @public
 *
 * The input for {@link SetUserMFAPreferenceCommand}.
 */
export interface SetUserMFAPreferenceCommandInput
	extends SetUserMFAPreferenceRequest {}
/**
 * @public
 *
 * The output of {@link SetUserMFAPreferenceCommand}.
 */
export interface SetUserMFAPreferenceCommandOutput
	extends SetUserMFAPreferenceResponse,
		__MetadataBearer {}
/**
 * @public
 */
export interface SetUserMFAPreferenceRequest {
	/**
	 * @public
	 * <p>The SMS text message multi-factor authentication (MFA) settings.</p>
	 */
	SMSMfaSettings?: SMSMfaSettingsType;
	/**
	 * @public
	 * <p>The time-based one-time password (TOTP) software token MFA settings.</p>
	 */
	SoftwareTokenMfaSettings?: SoftwareTokenMfaSettingsType;
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose MFA preference you want to
	 *             set.</p>
	 */
	AccessToken: string | undefined;
}
/**
 * @public
 */
export interface SetUserMFAPreferenceResponse {}
/**
 * @public
 *
 * The input for {@link SignUpCommand}.
 */
export interface SignUpCommandInput extends SignUpRequest {}
/**
 * @public
 *
 * The output of {@link SignUpCommand}.
 */
export interface SignUpCommandOutput extends SignUpResponse, __MetadataBearer {}
/**
 * @public
 * <p>Represents the request to register a user.</p>
 */
export interface SignUpRequest {
	/**
	 * @public
	 * <p>The ID of the client associated with the user pool.</p>
	 */
	ClientId: string | undefined;
	/**
	 * @public
	 * <p>A keyed-hash message authentication code (HMAC) calculated using the secret key of a
	 *             user pool client and username plus the client ID in the message.</p>
	 */
	SecretHash?: string;
	/**
	 * @public
	 * <p>The user name of the user you want to register.</p>
	 */
	Username: string | undefined;
	/**
	 * @public
	 * <p>The password of the user you want to register.</p>
	 */
	Password: string | undefined;
	/**
	 * @public
	 * <p>An array of name-value pairs representing user attributes.</p>
	 *          <p>For custom attributes, you must prepend the <code>custom:</code> prefix to the
	 *             attribute name.</p>
	 */
	UserAttributes?: AttributeType[];
	/**
	 * @public
	 * <p>The validation data in the request to register a user.</p>
	 */
	ValidationData?: AttributeType[];
	/**
	 * @public
	 * <p>The Amazon Pinpoint analytics metadata that contributes to your metrics for
	 *                 <code>SignUp</code> calls.</p>
	 */
	AnalyticsMetadata?: AnalyticsMetadataType;
	/**
	 * @public
	 * <p>Contextual data about your user session, such as the device fingerprint, IP address, or location. Amazon Cognito advanced
	 * security evaluates the risk of an authentication event based on the context that your app generates and passes to Amazon Cognito
	 * when it makes API requests.</p>
	 */
	UserContextData?: UserContextDataType;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action triggers.</p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool triggers.
	 *             When you use the SignUp API action, Amazon Cognito invokes any functions that are assigned to the
	 *             following triggers: <i>pre sign-up</i>, <i>custom
	 *                 message</i>, and <i>post confirmation</i>. When Amazon Cognito invokes
	 *             any of these functions, it passes a JSON payload, which the function receives as input.
	 *             This payload contains a <code>clientMetadata</code> attribute, which provides the data
	 *             that you assigned to the ClientMetadata parameter in your SignUp request. In your
	 *             function code in Lambda, you can process the <code>clientMetadata</code> value to enhance
	 *             your workflow for your specific needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>The response from the server for a registration request.</p>
 */
export interface SignUpResponse {
	/**
	 * @public
	 * <p>A response from the server indicating that a user registration has been
	 *             confirmed.</p>
	 */
	UserConfirmed: boolean | undefined;
	/**
	 * @public
	 * <p>The code delivery details returned by the server response to the user registration
	 *             request.</p>
	 */
	CodeDeliveryDetails?: CodeDeliveryDetailsType;
	/**
	 * @public
	 * <p>The UUID of the authenticated user. This isn't the same as
	 *             <code>username</code>.</p>
	 */
	UserSub: string | undefined;
}
/**
 * @public
 * <p>The type used for enabling software token MFA at the user level. If an MFA type is
 *             activated for a user, the user will be prompted for MFA during all sign-in attempts,
 *             unless device tracking is turned on and the device has been trusted. If you want MFA to
 *             be applied selectively based on the assessed risk level of sign-in attempts, deactivate
 *             MFA for users and turn on Adaptive Authentication for the user pool.</p>
 */
export interface SoftwareTokenMfaSettingsType {
	/**
	 * @public
	 * <p>Specifies whether software token MFA is activated. If an MFA type is activated for a
	 *             user, the user will be prompted for MFA during all sign-in attempts, unless device
	 *             tracking is turned on and the device has been trusted.</p>
	 */
	Enabled?: boolean;
	/**
	 * @public
	 * <p>Specifies whether software token MFA is the preferred MFA method.</p>
	 */
	PreferredMfa?: boolean;
}
/**
 * @public
 *
 * The input for {@link UpdateDeviceStatusCommand}.
 */
export interface UpdateDeviceStatusCommandInput
	extends UpdateDeviceStatusRequest {}
/**
 * @public
 *
 * The output of {@link UpdateDeviceStatusCommand}.
 */
export interface UpdateDeviceStatusCommandOutput
	extends UpdateDeviceStatusResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to update the device status.</p>
 */
export interface UpdateDeviceStatusRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose device status you want to
	 *             update.</p>
	 */
	AccessToken: string | undefined;
	/**
	 * @public
	 * <p>The device key.</p>
	 */
	DeviceKey: string | undefined;
	/**
	 * @public
	 * <p>The status of whether a device is remembered.</p>
	 */
	DeviceRememberedStatus?: DeviceRememberedStatusType | string;
}
/**
 * @public
 * <p>The response to the request to update the device status.</p>
 */
export interface UpdateDeviceStatusResponse {}
/**
 * @public
 *
 * The input for {@link UpdateUserAttributesCommand}.
 */
export interface UpdateUserAttributesCommandInput
	extends UpdateUserAttributesRequest {}
/**
 * @public
 *
 * The output of {@link UpdateUserAttributesCommand}.
 */
export interface UpdateUserAttributesCommandOutput
	extends UpdateUserAttributesResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to update user attributes.</p>
 */
export interface UpdateUserAttributesRequest {
	/**
	 * @public
	 * <p>An array of name-value pairs representing user attributes.</p>
	 *          <p>For custom attributes, you must prepend the <code>custom:</code> prefix to the
	 *             attribute name.</p>
	 *          <p>If you have set an attribute to require verification before Amazon Cognito updates its value,
	 *             this request doesn’t immediately update the value of that attribute. After your user
	 *             receives and responds to a verification message to verify the new value, Amazon Cognito updates
	 *             the attribute value. Your user can sign in and receive messages with the original
	 *             attribute value until they verify the new value.</p>
	 */
	UserAttributes: AttributeType[] | undefined;
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose user attributes you want to
	 *             update.</p>
	 */
	AccessToken: string | undefined;
	/**
	 * @public
	 * <p>A map of custom key-value pairs that you can provide as input for any custom workflows
	 *             that this action initiates. </p>
	 *          <p>You create custom workflows by assigning Lambda functions to user pool triggers. When
	 *             you use the UpdateUserAttributes API action, Amazon Cognito invokes the function that is assigned
	 *             to the <i>custom message</i> trigger. When Amazon Cognito invokes this function, it
	 *             passes a JSON payload, which the function receives as input. This payload contains a
	 *                 <code>clientMetadata</code> attribute, which provides the data that you assigned to
	 *             the ClientMetadata parameter in your UpdateUserAttributes request. In your function code
	 *             in Lambda, you can process the <code>clientMetadata</code> value to enhance your workflow
	 *             for your specific needs.</p>
	 *          <p>For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html">
	 * Customizing user pool Workflows with Lambda Triggers</a> in the <i>Amazon Cognito Developer Guide</i>.</p>
	 *          <note>
	 *             <p>When you use the ClientMetadata parameter, remember that Amazon Cognito won't do the
	 *                 following:</p>
	 *             <ul>
	 *                <li>
	 *                   <p>Store the ClientMetadata value. This data is available only to Lambda
	 *                         triggers that are assigned to a user pool to support custom workflows. If
	 *                         your user pool configuration doesn't include triggers, the ClientMetadata
	 *                         parameter serves no purpose.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Validate the ClientMetadata value.</p>
	 *                </li>
	 *                <li>
	 *                   <p>Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide sensitive
	 *                         information.</p>
	 *                </li>
	 *             </ul>
	 *          </note>
	 */
	ClientMetadata?: Record<string, string>;
}
/**
 * @public
 * <p>Represents the response from the server for the request to update user
 *             attributes.</p>
 */
export interface UpdateUserAttributesResponse {
	/**
	 * @public
	 * <p>The code delivery details list from the server for the request to update user
	 *             attributes.</p>
	 */
	CodeDeliveryDetailsList?: CodeDeliveryDetailsType[];
}
/**
 * @public
 * <p>Contextual data, such as the user's device fingerprint, IP address, or location, used
 *             for evaluating the risk of an unexpected event by Amazon Cognito advanced security.</p>
 */
export interface UserContextDataType {
	/**
	 * @public
	 * <p>The source IP address of your user's device.</p>
	 */
	IpAddress?: string;
	/**
	 * @public
	 * <p>Encoded device-fingerprint details that your app collected with the Amazon Cognito
	 *             context data collection library. For more information, see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-adaptive-authentication.html#user-pool-settings-adaptive-authentication-device-fingerprint">Adding user device and session data to API requests</a>.</p>
	 */
	EncodedData?: string;
}
/**
 * @public
 *
 * The input for {@link VerifySoftwareTokenCommand}.
 */
export interface VerifySoftwareTokenCommandInput
	extends VerifySoftwareTokenRequest {}
/**
 * @public
 *
 * The output of {@link VerifySoftwareTokenCommand}.
 */
export interface VerifySoftwareTokenCommandOutput
	extends VerifySoftwareTokenResponse,
		__MetadataBearer {}
/**
 * @public
 */
export interface VerifySoftwareTokenRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose software token you want to
	 *             verify.</p>
	 */
	AccessToken?: string;
	/**
	 * @public
	 * <p>The session that should be passed both ways in challenge-response calls to the
	 *             service.</p>
	 */
	Session?: string;
	/**
	 * @public
	 * <p>The one- time password computed using the secret code returned by <a href="https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AssociateSoftwareToken.html">AssociateSoftwareToken</a>.</p>
	 */
	UserCode: string | undefined;
	/**
	 * @public
	 * <p>The friendly device name.</p>
	 */
	FriendlyDeviceName?: string;
}
/**
 * @public
 */
export interface VerifySoftwareTokenResponse {
	/**
	 * @public
	 * <p>The status of the verify software token.</p>
	 */
	Status?: VerifySoftwareTokenResponseType | string;
	/**
	 * @public
	 * <p>The session that should be passed both ways in challenge-response calls to the
	 *             service.</p>
	 */
	Session?: string;
}
/**
 * @public
 *
 * The input for {@link VerifyUserAttributeCommand}.
 */
export interface VerifyUserAttributeCommandInput
	extends VerifyUserAttributeRequest {}
/**
 * @public
 *
 * The output of {@link VerifyUserAttributeCommand}.
 */
export interface VerifyUserAttributeCommandOutput
	extends VerifyUserAttributeResponse,
		__MetadataBearer {}
/**
 * @public
 * <p>Represents the request to verify user attributes.</p>
 */
export interface VerifyUserAttributeRequest {
	/**
	 * @public
	 * <p>A valid access token that Amazon Cognito issued to the user whose user attributes you want to
	 *             verify.</p>
	 */
	AccessToken: string | undefined;
	/**
	 * @public
	 * <p>The attribute name in the request to verify user attributes.</p>
	 */
	AttributeName: string | undefined;
	/**
	 * @public
	 * <p>The verification code in the request to verify user attributes.</p>
	 */
	Code: string | undefined;
}
/**
 * @public
 * <p>A container representing the response from the server from the request to verify user
 *             attributes.</p>
 */
export interface VerifyUserAttributeResponse {}
/**
 * @public
 */
export type AuthFlowType = (typeof AuthFlowType)[keyof typeof AuthFlowType];
/**
 * @public
 */
export type ChallengeNameType =
	(typeof ChallengeNameType)[keyof typeof ChallengeNameType];
/**
 * @public
 */
export type DeliveryMediumType =
	(typeof DeliveryMediumType)[keyof typeof DeliveryMediumType];
/**
 * @public
 */
export type DeviceRememberedStatusType =
	(typeof DeviceRememberedStatusType)[keyof typeof DeviceRememberedStatusType];
/**
 * @public
 */
export type VerifySoftwareTokenResponseType =
	(typeof VerifySoftwareTokenResponseType)[keyof typeof VerifySoftwareTokenResponseType];

export {};
