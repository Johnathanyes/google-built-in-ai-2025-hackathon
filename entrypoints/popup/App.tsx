import { useState, useEffect } from 'react';
import { AuthService } from "../../utils/auth"
import type { UserData } from '../../utils/db';
import Auth from '@/components/Auth';

export default function App() {
  return (
    <Auth />
  )
}