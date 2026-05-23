"use server";

import fs from 'fs';
import path from 'path';
import { logEvent } from '@/lib/events';

// Garantizar que no salgamos de las carpetas permitidas (Path Traversal Protection)
const ROOT_DIR = process.cwd();

const getSafePath = (slug: string, type: 'legacy' | 'projects' | 'assets', relativePath: string) => {
  let basePath = "";
  if (type === 'legacy') basePath = path.join(ROOT_DIR, 'public', 'legacy', slug);
  else if (type === 'projects') basePath = path.join(ROOT_DIR, 'projects', slug);
  else if (type === 'assets') basePath = path.join(ROOT_DIR, 'public', 'assets', slug);
  
  const targetPath = path.join(basePath, relativePath);
  
  // Seguridad: Asegurar que el targetPath sigue dentro de basePath
  if (!targetPath.startsWith(basePath)) {
    throw new Error("Invalid path");
  }
  return targetPath;
};

export async function getFileTree(slug: string) {
  const tree: any[] = [];

  const buildTree = (dirPath: string, parentPath: string, type: string): any[] => {
    if (!fs.existsSync(dirPath)) return [];
    const items = fs.readdirSync(dirPath);
    return items.map(item => {
      const fullPath = path.join(dirPath, item);
      const isDir = fs.statSync(fullPath).isDirectory();
      const relativePath = path.join(parentPath, item).replace(/\\/g, '/');
      
      return {
        name: item,
        type: isDir ? 'directory' : 'file',
        path: relativePath,
        category: type,
        children: isDir ? buildTree(fullPath, relativePath, type) : []
      };
    });
  };

  // 1. Legacy HTML Files
  const legacyDir = path.join(ROOT_DIR, 'public', 'legacy', slug);
  if (fs.existsSync(legacyDir)) {
    tree.push({
      name: 'Legacy (HTML)',
      type: 'directory',
      path: '/',
      category: 'legacy',
      children: buildTree(legacyDir, '/', 'legacy')
    });
  }

  // 2. React/Next Config Files (Landing Factory)
  const projectDir = path.join(ROOT_DIR, 'projects', slug);
  if (fs.existsSync(projectDir)) {
    tree.push({
      name: 'Componentes (React)',
      type: 'directory',
      path: '/',
      category: 'projects',
      children: buildTree(projectDir, '/', 'projects')
    });
  }

  // 3. Assets Físicos
  const assetsDir = path.join(ROOT_DIR, 'public', 'assets', slug);
  if (fs.existsSync(assetsDir)) {
    tree.push({
      name: 'Assets',
      type: 'directory',
      path: '/',
      category: 'assets',
      children: buildTree(assetsDir, '/', 'assets')
    });
  }

  return tree;
}

export async function readFileContent(slug: string, category: 'legacy' | 'projects' | 'assets', filePath: string) {
  const safePath = getSafePath(slug, category, filePath);
  if (!fs.existsSync(safePath)) throw new Error("File not found");
  return fs.readFileSync(safePath, 'utf8');
}

export async function saveFileContent(slug: string, category: 'legacy' | 'projects' | 'assets', filePath: string, content: string) {
  const safePath = getSafePath(slug, category, filePath);
  fs.writeFileSync(safePath, content, 'utf8');
  await logEvent('code_edited', slug, { file: filePath, category });
  return true;
}
