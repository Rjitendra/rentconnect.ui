import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { User } from 'oidc-client';
import { OauthService } from '../../oauth/service/oauth.service';
import { TestService } from '../../oauth/service/test.service';



@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  imports: [CommonModule],
  providers: [ OauthService, TestService],
  standalone: true,
})
export class TestComponent implements OnInit {
  private oauthService = inject(OauthService);
  private testService = inject(TestService);

  user: User | null = null;
  apiResponse: any;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loadUser();
  }

  async loadUser() {
    this.user = await this.oauthService.getUser();
  }

  login() {
    this.oauthService.login();
  }

  async logout() {
    await this.oauthService.logout();
    this.user = null;
  }

  async callApi() {
    try {
      this.apiResponse = await this.testService.callApi();
    } catch (err) {
      console.error('API call failed', err);
      this.apiResponse = 'API call failed';
    }
  }
}
