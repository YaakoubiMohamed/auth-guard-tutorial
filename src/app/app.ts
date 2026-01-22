import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component
 * Uses zoneless change detection and standalone components
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
