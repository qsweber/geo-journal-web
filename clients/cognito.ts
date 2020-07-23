import {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUser,
} from "amazon-cognito-identity-js";

export interface User {
  id: string;
  jwtToken: string;
}

export class CognitoClient {
  private readonly userPool: CognitoUserPool;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: "us-west-2_EJmcdZc9Z",
      ClientId: "1p5vovpjk10489hipqj7j91ehb",
    });
  }

  private _getUser(username: string): CognitoUser {
    return new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });
  }

  async authenticateUser(username: string, password: string): Promise<User> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = this._getUser(username);

    return new Promise<User>((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();
          resolve({ id: cognitoUser.getUsername(), jwtToken: token });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async checkForLoggedInUser(): Promise<User | undefined> {
    const cognitoUser = this.userPool.getCurrentUser();
    console.log(cognitoUser);
    if (!cognitoUser) {
      return undefined;
    }

    return new Promise<User | undefined>((resolve, reject) => {
      cognitoUser.getSession((err: any, session: any): void => {
        if (err) {
          reject(err);
        } else {
          if (session.isValid() === false) {
            resolve(undefined);
          } else {
            console.log("64", session);
            resolve({
              id: cognitoUser.getUsername(),
              jwtToken: session.getIdToken().getJwtToken(),
            });
          }
        }
      });
    });
  }

  async signUp(username: string, password: string): Promise<void> {
    await new Promise<boolean>((resolve, reject) => {
      this.userPool.signUp(
        username,
        password,
        [],
        [],
        (err: any, _result: any): void => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async confirmRegistration(
    username: string,
    password: string,
    code: string
  ): Promise<User> {
    const user = this._getUser(username);

    await new Promise<boolean>((resolve, reject) => {
      user.confirmRegistration(code, true, (err: any, _result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });

    return this.authenticateUser(username, password);
  }

  signOut(): true {
    const cognitoUser = this.userPool.getCurrentUser();

    if (cognitoUser === null) {
      return true;
    }

    cognitoUser.signOut();

    return true;
  }
}