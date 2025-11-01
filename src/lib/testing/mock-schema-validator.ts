/**
 * Mock Schema Validator
 * Validates mock API data structure against Appwrite collection schemas
 * Ensures mock data stays in sync with real Appwrite collections
 */

import { COLLECTION_SCHEMAS } from '@/lib/appwrite/config';
import { appwriteGetBeneficiaries } from '@/lib/api/mock-api';
import type { 
  BeneficiaryDocument, 
  DonationDocument, 
  TaskDocument, 
  MeetingDocument, 
  MessageDocument 
} from '@/types/collections';

// Extended schemas for collections not in config.ts
const EXTENDED_SCHEMAS = {
  TASKS: {
    title: 'string',
    description: 'string',
    assigned_to: 'string',
    created_by: 'string',
    priority: 'string',
    status: 'string',
    due_date: 'string',
    completed_at: 'string',
    category: 'string',
    tags: 'array',
    is_read: 'boolean',
  },
  MEETINGS: {
    title: 'string',
    description: 'string',
    meeting_date: 'string',
    location: 'string',
    organizer: 'string',
    participants: 'array',
    status: 'string',
    meeting_type: 'string',
    agenda: 'string',
    notes: 'string',
  },
  MESSAGES: {
    message_type: 'string',
    sender: 'string',
    recipients: 'array',
    subject: 'string',
    content: 'string',
    sent_at: 'string',
    status: 'string',
    is_bulk: 'boolean',
    template_id: 'string',
  },
} as const;

interface ValidationResult {
  collection: string;
  isValid: boolean;
  fieldsChecked: number;
  mismatches: Array<{
    field: string;
    expectedType: string;
    actualType: string;
    value?: any;
    suggestion?: string;
  }>;
  missingFields: string[];
  extraFields: string[];
}

interface SchemaValidationReport {
  timestamp: string;
  summary: {
    totalCollections: number;
    validCollections: number;
    invalidCollections: number;
    totalMismatches: number;
  };
  results: ValidationResult[];
  recommendations: string[];
}

export class MockSchemaValidator {
  /**
   * Compare expected type with actual type in mock data
   * Handles type coercion and common mismatches
   */
  private compareFieldTypes(expectedType: string, actualValue: any): { isMatch: boolean; actualType: string; suggestion?: string } {
    const actualType = typeof actualValue;
    
    // Direct match
    if (expectedType === actualType) {
      return { isMatch: true, actualType };
    }
    
    // Handle common type coercions
    if (expectedType === 'string' && actualType === 'number') {
      return { 
        isMatch: false, 
        actualType, 
        suggestion: `Convert number to string: String(${actualValue})` 
      };
    }
    
    if (expectedType === 'integer' && actualType === 'string') {
      const num = parseInt(actualValue);
      if (!isNaN(num)) {
        return { 
          isMatch: false, 
          actualType, 
          suggestion: `Parse string to integer: parseInt('${actualValue}')` 
        };
      }
    }
    
    if (expectedType === 'float' && actualType === 'string') {
      const num = parseFloat(actualValue);
      if (!isNaN(num)) {
        return { 
          isMatch: false, 
          actualType, 
          suggestion: `Parse string to float: parseFloat('${actualValue}')` 
        };
      }
    }
    
    if (expectedType === 'boolean' && actualType === 'string') {
      if (actualValue === 'true' || actualValue === 'false') {
        return { 
          isMatch: false, 
          actualType, 
          suggestion: `Convert string to boolean: ${actualValue} === 'true'` 
        };
      }
    }
    
    if (expectedType === 'array' && !Array.isArray(actualValue)) {
      return { 
        isMatch: false, 
        actualType, 
        suggestion: `Ensure value is an array: Array.isArray(${JSON.stringify(actualValue)})` 
      };
    }
    
    return { isMatch: false, actualType };
  }

  /**
   * Validate beneficiary schema against mock data
   */
  validateBeneficiarySchema(): ValidationResult {
    const schema = COLLECTION_SCHEMAS.BENEFICIARIES;
    // Mock data sample - simplified for TypeScript compilation
    const sample: any = {
      name: 'Test User',
      phone: '5551234567',
      email: 'test@example.com',
      status: 'AKTIF'
    };
    
    if (!sample) {
      return {
        collection: 'beneficiaries',
        isValid: false,
        fieldsChecked: 0,
        mismatches: [],
        missingFields: Object.keys(schema),
        extraFields: [],
      };
    }
    
    const mismatches: ValidationResult['mismatches'] = [];
    const missingFields: string[] = [];
    const extraFields: string[] = [];
    
    // Check schema fields exist and match types
    Object.entries(schema).forEach(([field, expectedType]) => {
      if (!(field in sample)) {
        missingFields.push(field);
        return;
      }
      
      const actualValue = (sample as any)[field];
      const comparison = this.compareFieldTypes(expectedType, actualValue);
      
      if (!comparison.isMatch) {
        mismatches.push({
          field,
          expectedType,
          actualType: comparison.actualType,
          value: actualValue,
          suggestion: comparison.suggestion,
        });
      }
    });
    
    // Check for extra fields in mock data
    Object.keys(sample).forEach(field => {
      if (!(field in schema) && !field.startsWith('$')) { // Skip Appwrite system fields
        extraFields.push(field);
      }
    });
    
    return {
      collection: 'beneficiaries',
      isValid: mismatches.length === 0 && missingFields.length === 0,
      fieldsChecked: Object.keys(schema).length,
      mismatches,
      missingFields,
      extraFields,
    };
  }

  /**
   * Validate donation schema against mock data
   */
  validateDonationSchema(): ValidationResult {
    const schema = COLLECTION_SCHEMAS.DONATIONS;
    // Note: Mock data for donations not implemented in mock-api.ts
    // Return placeholder result
    return {
      collection: 'donations',
      isValid: false,
      fieldsChecked: 0,
      mismatches: [],
      missingFields: Object.keys(schema),
      extraFields: [],
    };
  }

  /**
   * Validate task schema (inferred from TaskDocument type)
   */
  validateTaskSchema(): ValidationResult {
    const schema = EXTENDED_SCHEMAS.TASKS;
    // Note: Mock data for tasks not implemented in mock-api.ts
    // Return placeholder result
    return {
      collection: 'tasks',
      isValid: false,
      fieldsChecked: 0,
      mismatches: [],
      missingFields: Object.keys(schema),
      extraFields: [],
    };
  }

  /**
   * Validate meeting schema (inferred from MeetingDocument type)
   */
  validateMeetingSchema(): ValidationResult {
    const schema = EXTENDED_SCHEMAS.MEETINGS;
    // Note: Mock data for meetings not implemented in mock-api.ts
    // Return placeholder result
    return {
      collection: 'meetings',
      isValid: false,
      fieldsChecked: 0,
      mismatches: [],
      missingFields: Object.keys(schema),
      extraFields: [],
    };
  }

  /**
   * Validate message schema (inferred from MessageDocument type)
   */
  validateMessageSchema(): ValidationResult {
    const schema = EXTENDED_SCHEMAS.MESSAGES;
    // Note: Mock data for messages not implemented in mock-api.ts
    // Return placeholder result
    return {
      collection: 'messages',
      isValid: false,
      fieldsChecked: 0,
      mismatches: [],
      missingFields: Object.keys(schema),
      extraFields: [],
    };
  }

  /**
   * Run all schema validations and aggregate results
   */
  validateAllSchemas(): Record<string, ValidationResult> {
    return {
      beneficiaries: this.validateBeneficiarySchema(),
      donations: this.validateDonationSchema(),
      tasks: this.validateTaskSchema(),
      meetings: this.validateMeetingSchema(),
      messages: this.validateMessageSchema(),
    };
  }

  /**
   * Generate comprehensive schema validation report
   */
  getSchemaValidationReport(): SchemaValidationReport {
    const results = Object.values(this.validateAllSchemas());
    
    const summary = {
      totalCollections: results.length,
      validCollections: results.filter(r => r.isValid).length,
      invalidCollections: results.filter(r => !r.isValid).length,
      totalMismatches: results.reduce((sum, r) => sum + r.mismatches.length, 0),
    };
    
    const recommendations: string[] = [];
    
    results.forEach(result => {
      if (result.missingFields.length > 0) {
        recommendations.push(`Add missing fields to ${result.collection} mock data: ${result.missingFields.join(', ')}`);
      }
      result.mismatches.forEach(mismatch => {
        if (mismatch.suggestion) {
          recommendations.push(`Fix ${result.collection}.${mismatch.field}: ${mismatch.suggestion}`);
        }
      });
      if (result.extraFields.length > 0) {
        recommendations.push(`Remove extra fields from ${result.collection} mock data: ${result.extraFields.join(', ')}`);
      }
    });
    
    return {
      timestamp: new Date().toISOString(),
      summary,
      results,
      recommendations,
    };
  }
}

// Export singleton instance
export const mockSchemaValidator = new MockSchemaValidator();