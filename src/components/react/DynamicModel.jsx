// src/components/react/DynamicModel.jsx
import React, { Suspense } from 'react';
import { useGLTF, TransformControls } from '@react-three/drei';
import { editable as e } from '@theatre/r3f';
import useStore from '../../store/useStore';
import { RigidBody } from '@react-three/rapier';

// We dynamically import EditableGroup fallback for SSR
const EditableGroup = React.lazy(() => import('@theatre/r3f').then(module => ({ default: module.editable.group })));

const ModelMesh = ({ url }) => {
  const { scene } = useGLTF(url);
  // Clone the scene so we can reuse it without mutating the cached original
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} />;
};

const DynamicModel = ({ position = [0, 0, 0] }) => {
  const customModelUrl = useStore((state) => state.config.customModelUrl);
  const isAdminMode = useStore((state) => state.isAdminMode);
  const physicsEnabled = useStore((state) => state.config.physics?.enabled);

  if (!customModelUrl) return null;

  const GroupComponent = typeof window !== 'undefined' ? EditableGroup : 'group';

  const modelGroup = (
    <Suspense fallback={null}>
        <GroupComponent theatreKey="Custom Model" position={position}>
            <ModelMesh url={customModelUrl} />
        </GroupComponent>
    </Suspense>
  );

  // If physics is enabled, wrap in RigidBody so it falls and collides
  const physicsWrappedModel = physicsEnabled ? (
    <RigidBody colliders="hull" type="dynamic" position={position}>
      {modelGroup}
    </RigidBody>
  ) : (
    modelGroup
  );

  return isAdminMode && !physicsEnabled ? (
    <TransformControls mode="translate">
      {modelGroup}
    </TransformControls>
  ) : (
    physicsWrappedModel
  );
};

export default DynamicModel;
