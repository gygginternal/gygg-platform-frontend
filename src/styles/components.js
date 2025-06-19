import styled, { css } from 'styled-components';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
} from './theme';

// Button variants
const buttonVariants = {
  primary: css`
    background-color: ${colors.primary.main};
    color: ${colors.primary.contrast};
    &:hover {
      background-color: ${colors.primary.dark};
    }
  `,
  secondary: css`
    background-color: ${colors.secondary.main};
    color: ${colors.secondary.contrast};
    &:hover {
      background-color: ${colors.secondary.dark};
    }
  `,
  outline: css`
    background-color: transparent;
    border: 1px solid ${colors.primary.main};
    color: ${colors.primary.main};
    &:hover {
      background-color: ${colors.primary.main};
      color: ${colors.primary.contrast};
    }
  `,
  text: css`
    background-color: transparent;
    color: ${colors.primary.main};
    padding: ${spacing.xs} ${spacing.sm};
    &:hover {
      background-color: ${colors.neutral[100]};
    }
  `,
};

// Button sizes
const buttonSizes = {
  small: css`
    padding: ${spacing.xs} ${spacing.sm};
    font-size: ${typography.fontSize.sm};
  `,
  medium: css`
    padding: ${spacing.sm} ${spacing.md};
    font-size: ${typography.fontSize.md};
  `,
  large: css`
    padding: ${spacing.md} ${spacing.lg};
    font-size: ${typography.fontSize.lg};
  `,
};

export const Button = styled.button`
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeight.medium};
  border-radius: ${borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${transitions.fast} ${transitions.easing.easeInOut};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  ${({ variant = 'primary' }) => buttonVariants[variant]}
  ${({ size = 'medium' }) => buttonSizes[size]}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Card = styled.div`
  background-color: ${colors.background.default};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};
  padding: ${spacing.lg};
  transition: box-shadow ${transitions.fast} ${transitions.easing.easeInOut};

  &:hover {
    box-shadow: ${shadows.lg};
  }
`;

export const Input = styled.input`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.md};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  width: 100%;
  transition: border-color ${transitions.fast} ${transitions.easing.easeInOut};

  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
  }

  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

export const TextArea = styled.textarea`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.md};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  width: 100%;
  min-height: 100px;
  resize: vertical;
  transition: border-color ${transitions.fast} ${transitions.easing.easeInOut};

  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
  }

  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

export const Select = styled.select`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.md};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  width: 100%;
  background-color: ${colors.background.default};
  cursor: pointer;
  transition: border-color ${transitions.fast} ${transitions.easing.easeInOut};

  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
  }
`;

export const Label = styled.label`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
  display: block;
`;

export const ErrorText = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.sm};
  color: ${colors.error.main};
  margin-top: ${spacing.xs};
  display: block;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ columns = 1 }) => columns}, 1fr);
  gap: ${({ gap = 'md' }) => spacing[gap]};
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'stretch' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  gap: ${({ gap = 'md' }) => spacing[gap]};
`;

export const Heading = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md};
`;

export const Text = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.md};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`; 