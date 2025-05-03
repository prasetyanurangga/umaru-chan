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
 

const formPreviewSchema = z.object({
  endpointUrl: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  params: z.array(
    z.object({
      name: z.string().min(1, "Nama param wajib diisi"),
      value:z.string().min(1, "Value param wajib diisi"),
    })
  ),
  headers: z.array(
    z.object({
      name: z.string().min(1, "Nama Header wajib diisi"),
      value:z.string().min(1, "Value Header wajib diisi"),
    })
  ),
})



 

function CardFormDataPreview({
    onSubmit
}) {

  const formPreview = useForm<z.infer<typeof formPreviewSchema>>({
    resolver: zodResolver(formPreviewSchema),
    defaultValues: {
      endpointUrl: "",
      method: "GET",
      params: [],
      headers: [],
    },
  })



  const { fields: fieldsParams, append: appendParams, remove: removeParams } = useFieldArray({
    control: formPreview.control,
    name: "params",
  })

  const { fields: fieldsHeaders, append: appendHeaders, remove: removeHeaders } = useFieldArray({
    control: formPreview.control,
    name: "headers",
  })


  function handleOnSubmit(values: z.infer<typeof formPreviewSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }




  return (
    
      <Form {...formPreview}>
      <form onSubmit={formPreview.handleSubmit(handleOnSubmit)}>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>Masukan Data</CardDescription>
        </CardHeader>
        <CardContent  className="space-y-4">
          
              <FormField
                control={formPreview.control}
                name="endpointUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukan Endpoint URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formPreview.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Params</Label>
                {fieldsParams.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={formPreview.control}
                      name={`params.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formPreview.control}
                      name={`params.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeParams(index)}
                      className="h-10 px-3"
                    >
                      🗑
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => appendParams({ name: "", value: "" })}>
                  + Add Param
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Header</Label>
                {fieldsHeaders.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={formPreview.control}
                      name={`headers.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formPreview.control}
                      name={`headers.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeHeaders(index)}
                      className="h-10 px-3"
                    >
                      🗑
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => appendHeaders({ name: "", value: "" })}>
                  + Add Header
                </Button>
              </div>



        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button type='submit'>Deploy</Button>
        </CardFooter>
      </Card>

      </form>
          </Form>
  );
}

export default CardFormDataPreview;
