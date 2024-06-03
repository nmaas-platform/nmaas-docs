# **nmaas** home

nmaas or nmaas Platform is an open-source orchestration software that allows deployment of various containerized applications in a Kubernetes cluster. It is a versatile solution with many possible use-cases, two of which are currently actively supported in the context of the GÉANT project:

- nmaas Virtual NOC
- nmaas Virtual Lab

All use-cases take advantage of the same version of the nmaas Platform, and all of the functionality is available in the base version of the software. What distinguishes them is the way in which they are utilized.

nmaas Virtual NOC is the new name for what was formerly known as NMaaS (Network Management as a Service). With the pivot of the nmaas Platform to a general purpose application orchestration tool, not limited solely to network management, NMaaS was renamed to nmaas Virtual NOC to avoid any confusion. More details about the Virtual NOC use-case are available on the [nmaas Virtual NOC page](use-cases/virtual-noc/vnoc-introduction.md).

nmaas Virtual Lab is a brand new use-case built on top of the nmaas Platform, introducing many new exciting features that ease the process of organizing hands-on exercises in an educational context. More information about the Virtual Lab use-case is available on the [nmaas Virtual Lab page](use-cases/virtual-lab/vlab-introduction.md).

## Managed nmaas Instances

The nmaas team offers access to multiple managed instances, depending on the use-case and overall context:

- [The nmaas Virtual NOC production instance](managed-nmaas/introduction/#the-virtual-noc-managed-instance) available on [https://nmaas.eu](https://nmaas.eu)
- [The nmaas Virtual Lab pilots instance](managed-nmaas/introduction/#the-virtual-lab-managed-instance) available on [https://vlab.dev.nmaas.eu](https://vlab.dev.nmaas.eu).
- [The generic Playground instance](managed-nmaas/nmaas-playground-instance.md) for testing out the overall feature set of nmaas.

## Self-hosted nmaas

nmaas [self-hosting](https://docs.nmaas.eu/self-hosted-nmaas/introduction/) options are also available for users having access to an existing Kubernetes infrastructure.
