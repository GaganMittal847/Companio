import { Response } from 'express';


export class Validator {
 
/**
 * Validates required fields in the provided data object.
 * @param requiredFields - An array of field names that are required.
 * @param data - The data object to check the required fields against.
 * @returns { isValid: boolean; missingFields: string[] } 
 *  - `isValid`: True if all required fields are present, false otherwise,`missingFields`: An array of field names that are missing or empty.
 */
    public static validateField(
      requiredFields: string[],
      data: Record<string, any>
    ): { isValid: boolean; missingFields: string[] } {
      // Check if data is null, undefined, or an empty object
      if (!data || Object.keys(data).length === 0) {
        return { isValid: false, missingFields: ["data"] };
      }

      // Check for missing fields
      const missingFields: string[] = requiredFields.filter((field) => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], data);
        return value === undefined || value === null ;
      });
    
      return { isValid: missingFields.length === 0, missingFields };
    }

}
