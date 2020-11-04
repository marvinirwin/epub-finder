import {Request, Response} from "express";
import {Body, Controller, Get, Post, Req, Res, HttpCode, UseGuards} from "@nestjs/common";
import {promisify} from "util";

import {User} from "../entities/User";
import {UsersService} from "../user/users.service";
import { Public } from "src/decorators/public";
import {UserFromReq} from "../decorators/userFromReq";
import {GoogleGuard, LoginGuard} from "../guards";
import {GithubGuard} from "../guards/github";
import {TwitterGuard} from "../guards/twitter";
import {SignUpDto} from "./signup.dto";

@Controller("/auth")
export class AuthController {
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Get("/login")
  public main(@UserFromReq() user: User): string {
    return `
      <html>
         <script>
					function handleclick(el) {
            window.open(el.href, '_blank', 'height=600,width=800,top=0,left=0');
            return false
					}
				</script>
        <body>
          <p>logged in as ${JSON.stringify(user)}</p>
          <form action="/auth/login" method="post">
            <input type="email" name="email" />
            <input type="password" name="password" />
            <input type="submit" />
          </form>
          <p>or login with other providers</p>
          <ul>
            <li><a href="/auth/google" onClick="return handleclick(this)">google</a></li>
            <li><a href="/auth/facebook" onClick="return handleclick(this)">facebook</a></li>
            <li><a href="/auth/onelogin" onClick="return handleclick(this)">onelogin</a></li>
          </ul>
        </body>
      </html>
    `;
  }

  @Public()
  @UseGuards(LoginGuard)
  @Post("/login")
  public login(@UserFromReq() user: User): User {
    return user;
  }

  @Public()
  @HttpCode(204)
  @Get("/logout")
  public logout(@Req() req: Request, @Res() res: Response): void {
    // @ts-ignore
    req.session.destroy();
    req.logout();
    res.clearCookie("nest");
    res.send("");
  }

  @Public()
  @Post("/signup")
  public async signup(@Body() data: SignUpDto, @Req() req: Request): Promise<User> {
    const user = await this.userService.createBasicUser(data);
    await promisify(req.logIn.bind(req))(user);
    return user;
  }

  @Public()
  @Get("/google")
  @UseGuards(GoogleGuard)
  public googleLogin(): void {
    // initiates the Google OAuth2 login flow
  }

  @Public()
  @Get("/google/callback")
  @UseGuards(GoogleGuard)
  public googleLoginCallback(@UserFromReq() user: User): string {
    return `
      <html>
      	<script>
					function handleLoad() {
					  alert('${JSON.stringify(user)}');
						window.close();
					}
				</script>
        <body onload="handleLoad()" />
      </html>
    `;
  }
  @Public()
  @Get("/github")
  @UseGuards(GithubGuard)
  public githubLogin(): void {
    // initiates the Github OAuth2 login flow
  }

  @Public()
  @Get("/github/callback")
  @UseGuards(GithubGuard)
  public githubLoginCallback(@UserFromReq() user: User): string {
    return `
      <html>
      	<script>
					function handleLoad() {
					  alert('${JSON.stringify(user)}');
						window.close();
					}
				</script>
        <body onload="handleLoad()" />
      </html>
    `;
  }
  @Public()
  @Get("/twitter")
  @UseGuards(TwitterGuard)
  public twitterLogin(): void {
    // initiates the Twitter OAuth2 login flow
  }

  @Public()
  @Get("/twitter/callback")
  @UseGuards(TwitterGuard)
  public twitterLoginCallback(@UserFromReq() user: User): string {
    return `
      <html>
      	<script>
					function handleLoad() {
					  alert('${JSON.stringify(user)}');
						window.close();
					}
				</script>
        <body onload="handleLoad()" />
      </html>
    `;
  }
}
