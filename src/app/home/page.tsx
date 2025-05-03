'use client';

import React, { useState, useEffect } from 'react';


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { z } from "zod"
import { useForm } from 'react-hook-form';
import { useFieldArray } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import CardFormDataPreview from '@/components/custom/card-form-data-preview';
 


 

function Home() {



  return (
    <div className="app-container h-screen w-screen flex gap-x-4 flex-row justify-center items-center">
      <CardFormDataPreview onSubmit={() => {}} />
      <CardFormDataPreview onSubmit={() => {}} />
    </div>
  );
}

export default Home;
